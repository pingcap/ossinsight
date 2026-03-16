import {GithubRepoDao} from "@dao/github-repo-dao";
import {AppConfig} from "@env";
import {GitHubHelper} from "@libs/github/helper";
import {createOctokitPool} from "@libs/github/octokit";
import {PrismaClient} from "@prisma/client";
import async from "async";
import {Command} from "commander";
import {Logger} from "pino";

const DEFAULT_SPECIFY_SYNC_REPOS_SQL = `
    SELECT repo_id AS repoId, repo_name AS repoName
    FROM github_repos
    WHERE last_event_at != 0
      AND (DATEDIFF(last_event_at, refreshed_at) > 5 OR refreshed_at = 0)
      AND is_deleted = 0
    ORDER BY last_event_at DESC
    LIMIT 1000
`;

interface Option {
  sql: string;
}

/**
 * @sub-command sync-github repos sync-in-concurrent
 * @description Sync repos in concurrent by GitHub REST API.
 */
export function initSyncReposInConcurrentCommand(command: Command, config: AppConfig, logger: Logger) {
  command.command('sync-in-concurrent')
    .option<string>(
      '--sql <SQL>',
      `Specify which repositories need to be synchronized through SQL query results.`,
      (value) => String(value),
      DEFAULT_SPECIFY_SYNC_REPOS_SQL
    )
    .description('Sync repos in concurrent by GitHub REST API.')
    .action(async (options) => {
      await syncReposInConcurrent(logger, config, options);
    });
}

// Sync repos in concurrent.
export async function syncReposInConcurrent(
  rootLogger: Logger, config: AppConfig, options: Option
) {
  const {sql} = options;

  // Init GitHub helper.
  const octokitPool = createOctokitPool(rootLogger, config.GITHUB_ACCESS_TOKENS);
  const githubHelper = new GitHubHelper(rootLogger, octokitPool);

  // Init GitHub Repo Dao.
  const prisma = new PrismaClient();
  const githubRepoDao = new GithubRepoDao(rootLogger, prisma);


  const concurrent = octokitPool.max;
  const queue = async.queue(async ({repoId, repoName}) => {
    const repoNode = await githubHelper.getRepoByRepoName(repoName);

    if (repoNode) {
      await githubRepoDao.upsertRepoNode(repoNode);
    }
  }, concurrent);

  // Dispatch sync jobs.
  while (true) {
    if (queue.started) {
      await queue.unsaturated();
    }

    try {
      rootLogger.info(`Fetch repos...`);
      const repos = await prisma.$queryRaw<any>`${sql}`;

      if (Array.isArray(repos) && repos.length > 0) {
        repos.forEach((repo) => {
          queue.pushAsync({
            repoId: repo.repoId,
            repoName: repo.repoName
          });
        });
      } else {
        break;
      }
    } catch (err) {
      rootLogger.error(`Failed to fetch repos:`, err);
      throw err;
    }
  }

  // Wait for the workers finished all the jobs.
  await queue.drain();
}
