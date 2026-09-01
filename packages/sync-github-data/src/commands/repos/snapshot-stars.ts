import {RepoStarSnapshot, RepoStarSnapshotDao} from "@dao/repo-star-snapshot-dao";
import {AppConfig} from "@env";
import {processInBatch} from "@libs/concurrent";
import {GitHubHelper} from "@libs/github/helper";
import {createOctokitPool} from "@libs/github/octokit";
import {PrismaClient} from "@prisma/client";
import {Command, InvalidArgumentError} from "commander";
import {DateTime} from "luxon";
import {Logger} from "pino";

export const SNAPSHOT_SOURCE_GITHUB_GRAPHQL = 'github_graphql';

// ~10 aliased repository lookups per GraphQL request costs about 1 rate-limit
// point, so the whole collection repo universe (~2.5k repos) fits into a few
// hundred points out of 5,000/hour/token.
export const DEFAULT_SNAPSHOT_BATCH_SIZE = 10;
export const MAX_SNAPSHOT_BATCH_SIZE = 100;

// The full set of repos that appear in any active (non-deleted) collection.
// Prefer github_repos.repo_name (kept fresh by the other sync commands) over
// the collection_items copy, which can go stale after a repo rename.
const COLLECTION_REPOS_SQL = `
    SELECT DISTINCT ci.repo_id                           AS repoId,
                    COALESCE(gr.repo_name, ci.repo_name) AS repoName
    FROM collection_items ci
             JOIN collections c ON c.id = ci.collection_id AND c.deleted_at IS NULL
             LEFT JOIN github_repos gr ON gr.repo_id = ci.repo_id AND gr.is_deleted = 0
    WHERE ci.deleted_at IS NULL
`;

export interface Options {
  dryRun: boolean;
  batchSize: number;
  repos?: string;
  snapshotDay?: string;
}

export interface TargetRepo {
  repoId: number | null;
  repoName: string;
}

/**
 * @sub-command sync-github repos snapshot-stars
 * @description Record a daily stargazer count snapshot for every collection repo.
 */
export function initSnapshotStarsCommand(pCommand: Command, config: AppConfig, logger: Logger) {
  pCommand.command('snapshot-stars')
    .description(`Record today's stargazer count (GitHub GraphQL stargazerCount) for every repo that belongs
to a collection into the sys_repo_star_snapshots table. Idempotent: re-running on the same day
refreshes the same rows.`)
    .option('--dry-run', 'Fetch stargazer counts but skip all database writes, printing what would be written.', false)
    .option<number>(
      '--batch-size <number>',
      `How many repos to look up per GraphQL request (via field aliases). Default: ${DEFAULT_SNAPSHOT_BATCH_SIZE}.`,
      (value) => {
        const parsed = parseInt(value, 10);
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_SNAPSHOT_BATCH_SIZE) {
          throw new InvalidArgumentError(`Batch size must be an integer between 1 and ${MAX_SNAPSHOT_BATCH_SIZE}.`);
        }
        return parsed;
      },
      DEFAULT_SNAPSHOT_BATCH_SIZE
    )
    .option(
      '--repos [string]',
      `Comma-separated list of "{owner}/{repo}" or "{repoId}:{owner}/{repo}" entries to snapshot instead of
loading the collection repos from the database. Combined with --dry-run, this lets the command run
without a DATABASE_URL. For example: --repos=41986369:pingcap/tidb,vuejs/core`
    )
    .option(
      '--snapshot-day [string]',
      'The UTC day (YYYY-MM-DD) to record the snapshots under. Default: today (UTC).'
    )
    .action(async (options: Options) => {
      try {
        await snapshotStars(config, logger, options);
      } catch (err) {
        logger.error(err, `⭐ Failed to snapshot stargazer counts.`);
        // The pino transport worker can lose logs when the process exits right
        // after a synchronous failure, so mirror the fatal error on stderr.
        console.error('Failed to snapshot stargazer counts:', err);
        process.exitCode = 1;
      }
    });
}

export function resolveSnapshotDay(snapshotDay?: string): string {
  if (!snapshotDay) {
    return DateTime.utc().toFormat('yyyy-LL-dd');
  }

  const parsed = DateTime.fromISO(snapshotDay, {zone: 'utc'});
  if (!parsed.isValid || parsed.toFormat('yyyy-LL-dd') !== snapshotDay) {
    throw new Error(`Invalid --snapshot-day: ${snapshotDay}, expected the YYYY-MM-DD format.`);
  }

  return snapshotDay;
}

export function parseReposArg(reposArg: string): TargetRepo[] {
  return reposArg
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const matched = /^(?:(\d+):)?(.+)$/.exec(entry);
      if (!matched) {
        throw new Error(`Invalid --repos entry: ${entry}, expected "{owner}/{repo}" or "{repoId}:{owner}/{repo}".`);
      }
      return {
        repoId: matched[1] ? Number(matched[1]) : null,
        repoName: matched[2],
      };
    });
}

async function loadCollectionRepos(prisma: PrismaClient): Promise<TargetRepo[]> {
  const rows = await prisma.$queryRawUnsafe<Array<{repoId: number | bigint, repoName: string}>>(COLLECTION_REPOS_SQL);

  // A repo can appear in many collections (and, when the github_repos row is
  // missing, under different stale names): keep one entry per repo id.
  const reposById = new Map<number, TargetRepo>();
  for (const row of rows) {
    const repoId = Number(row.repoId);
    if (!reposById.has(repoId)) {
      reposById.set(repoId, {repoId, repoName: row.repoName});
    }
  }

  return [...reposById.values()];
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function snapshotStars(config: AppConfig, logger: Logger, options: Options) {
  const {dryRun, batchSize, repos: reposArg} = options;
  const snapshotDay = resolveSnapshotDay(options.snapshotDay);

  // Init the GitHub helper.
  const octokitPool = createOctokitPool(logger, config.GITHUB_ACCESS_TOKENS);
  const githubHelper = new GitHubHelper(logger, octokitPool);

  // The database is needed to load the repo set (unless --repos is given) and to
  // write the snapshots (unless --dry-run is given).
  let prisma: PrismaClient | null = null;
  let snapshotDao: RepoStarSnapshotDao | null = null;
  if (!reposArg || !dryRun) {
    if (!config.DATABASE_URL) {
      throw new Error(`DATABASE_URL is required (only "--dry-run --repos <...>" can run without it).`);
    }
    // TiDB Serverless rejects unencrypted connections, and Prisma only negotiates
    // TLS when the URL asks for it. The shared DATABASE_URL secret is also read by
    // jobs using the @tidbcloud/serverless driver, which needs no such parameter,
    // so the secret cannot simply be rewritten — normalize here instead of
    // depending on its exact format.
    prisma = new PrismaClient({
      datasources: { db: { url: withTiDBSsl(config.DATABASE_URL) } },
    });
    snapshotDao = new RepoStarSnapshotDao(logger, prisma);
  }

  // Load the target repos.
  const targetRepos = reposArg ? parseReposArg(reposArg) : await loadCollectionRepos(prisma!);
  logger.info(`⭐ Begin to snapshot stargazer counts for ${targetRepos.length} repos on ${snapshotDay} (dryRun=${dryRun}).`);

  // Make sure the snapshot table exists before the first write.
  if (snapshotDao !== null && !dryRun) {
    await snapshotDao.ensureTable(config.CONFIGS_PATH);
  }

  const counters = {processed: 0, written: 0, failed: 0};
  // NOTE: each batch is wrapped in an object because async.queue (inside
  // processInBatch) treats a pushed array as a list of individual tasks.
  const batches = chunkArray(targetRepos, batchSize).map((repos) => ({repos}));
  await processInBatch<{repos: TargetRepo[]}>(batches, octokitPool.max, async ({repos: batch}) => {
    try {
      const {nodes, missing} = await githubHelper.batchGetRepoStarCounts(batch.map((repo) => repo.repoName));
      const retrievedAt = new Date();

      const snapshots: RepoStarSnapshot[] = [];
      for (const repo of batch) {
        const node = nodes.get(repo.repoName);
        if (!node) {
          continue;
        }

        if (repo.repoId !== null && repo.repoId !== node.databaseId) {
          logger.warn(`⭐ Repo ${repo.repoName} resolved to ${node.nameWithOwner} (id=${node.databaseId}), ` +
            `but the collection references id=${repo.repoId}, keeping the collection repo id.`);
        }

        const snapshot: RepoStarSnapshot = {
          repoId: repo.repoId ?? node.databaseId,
          snapshotDay,
          stargazerCount: node.stargazerCount,
          forksCount: typeof node.forkCount === 'number' ? node.forkCount : null,
          retrievedAt,
          source: SNAPSHOT_SOURCE_GITHUB_GRAPHQL,
        };

        if (dryRun) {
          logger.info(`⭐ [dry-run] Would write snapshot: repo_id=${snapshot.repoId} repo_name=${repo.repoName} ` +
            `snapshot_day=${snapshot.snapshotDay} stargazer_count=${snapshot.stargazerCount} forks_count=${snapshot.forksCount}`);
        }

        snapshots.push(snapshot);
      }

      for (const repoName of missing) {
        logger.warn(`⭐ Skip repo ${repoName}: not resolvable on GitHub (deleted, private or renamed without redirect).`);
      }

      if (!dryRun) {
        await snapshotDao!.upsertSnapshots(snapshots);
      }

      counters.processed += batch.length;
      counters.written += snapshots.length;
      counters.failed += batch.length - snapshots.length;
    } catch (err) {
      counters.processed += batch.length;
      counters.failed += batch.length;
      logger.error(err, `⭐ Failed to snapshot a batch of ${batch.length} repos (first: ${batch[0]?.repoName}).`);
    }
  });

  logger.info(`⭐ Snapshot summary: snapshot_day=${snapshotDay} repos_processed=${counters.processed} ` +
    `snapshots_${dryRun ? 'planned' : 'written'}=${counters.written} failures=${counters.failed}` +
    `${dryRun ? ' (dry-run, no database writes)' : ''}`);

  await prisma?.$disconnect();

  if (counters.processed > 0 && counters.written === 0) {
    throw new Error(`All ${counters.processed} repos failed to snapshot, see the logs above.`);
  }
}

/**
 * Ensure a TiDB Serverless connection string carries `sslaccept=strict`, which
 * Prisma needs to negotiate TLS, and accept the `tidb://` scheme some deployed
 * configs use.
 */
export function withTiDBSsl(url: string): string {
  if (!url) return url;
  const normalized = url.replace(/^tidb:\/\//, 'mysql://');
  if (/[?&]sslaccept=/.test(normalized)) return normalized;
  return normalized + (normalized.includes('?') ? '&' : '?') + 'sslaccept=strict';
}
