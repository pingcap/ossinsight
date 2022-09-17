import * as dotenv from "dotenv";
import path from 'path';
import consola from "consola";
import { ConnectionWrapper, getConnectionOptions } from "../../app/utils/db";
import { createConnection } from "mysql2";
import { DEFAULT_PULL_HISTORY_REPOS_LIMIT, DEFAULT_PULL_HISTORY_REPOS_MIN_ROWS, pullOrgReposByLimit, pullOrgReposByTimeRangeWithLang, pullPersonalReposByLimit, pullPersonalReposByTimeRangeWithLang, pullReposWithLang, pullReposWithoutLang } from "./puller";
import { syncForkRepos, syncRepos } from "./syncer";
import { createPool, Pool } from "generic-pool";
import { DateTime } from "luxon";
import { JobWorker, WorkerFactory } from "./worker";
import schedule from 'node-schedule';

const DEFAULT_SYNC_STEP = 10;   // 10 minutes.

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

// Init logger.
const logger = consola.withTag('sync-repos');

export interface GitHubRepo {
    repoId: number;
    repoName: string;
    ownerId: number;
    ownerLogin: string;
    ownerIsOrg: number;
    description?: string | null;
    primaryLanguage?: string | null;
    license?: string;
    size?: number;
    stars?: number;
    forks?: number;
    parentRepoId?: number;
    isFork?: boolean;
    isArchived?: boolean;
    isDeleted?: boolean;
    latestReleasedAt?: Date;
    pushedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    refreshedAt?: Date;
}

async function main() {
    // Pull github repos from `github_events` table.
    if (process.env.PULL_HISTORY_REPOS === '1') {
        const conn = new ConnectionWrapper(getConnectionOptions());

        if (process.env.SKIP_PULL_REPOS_WITH_LANG !== '1') {
            let from, to;
            if (process.env.PULL_HISTORY_REPOS_FROM === undefined) {
                from = DateTime.utc(2011, 2, 12);
            } else {
                from = DateTime.fromSQL(process.env.PULL_HISTORY_REPOS_FROM)
            }
        
            if (process.env.PULL_HISTORY_REPOS_TO === undefined) {
                to = DateTime.utc();
            } else {
                to = DateTime.fromSQL(process.env.PULL_HISTORY_REPOS_TO)
            }

            await pullReposWithLang(conn, from, to);
        }
        
        if (process.env.SKIP_PULL_REPOS_WITHOUT_LANG !== '1') {
            let limit = DEFAULT_PULL_HISTORY_REPOS_LIMIT;
            if (process.env.PULL_HISTORY_REPOS_LIMIT !== undefined) {
                limit = Number(process.env.PULL_HISTORY_REPOS_LIMIT)
            }
        
            let minRows = DEFAULT_PULL_HISTORY_REPOS_MIN_ROWS;
            if (process.env.PULL_HISTORY_REPOS_MIN_ROWS !== undefined) {
                minRows = Number(process.env.PULL_HISTORY_REPOS_END_COUNT)
            }

            await pullReposWithoutLang(conn, limit, minRows);
        }
    }

    // Sync repos in batch by GitHub GraphQL API.
    if (process.env.SYNC_REPOS === '1') {
        // Init Worker Pool.
        const workerPool = createWorkerPool();

        // Generate sync jobs.
        let from: DateTime, to: DateTime, step: number;
        if (process.env.SYNC_HISTORY_REPOS_FROM === undefined) {
            from = DateTime.utc(2008, 2, 1);
        } else {
            from = DateTime.fromSQL(process.env.SYNC_HISTORY_REPOS_FROM).toUTC()
        }

        if (process.env.SYNC_HISTORY_REPOS_TO === undefined) {
            to = DateTime.utc();
        } else {
            to = DateTime.fromSQL(process.env.SYNC_HISTORY_REPOS_TO).toUTC()
        }

        if (process.env.SYNC_HISTORY_REPOS_STEP === undefined) {
            step = DEFAULT_SYNC_STEP;
        } else {
            step = Number(process.env.SYNC_HISTORY_REPOS_STEP)
        }

        const duration = { 'days': 1 };
        const filter = process.env.SYNC_REPOS_GQL_FILTER;

        await syncRepos(workerPool, from, to, duration, step, filter);

        // Clear worker pool.
        workerPool.clear();
    }

    // Sync fork of repos in batch by GitHub GraphQL API.
    if (process.env.SYNC_FORK_REPOS === '1') {
        // Init Worker Pool.
        const workerPool = createWorkerPool();
        const conn = createConnection(getConnectionOptions());

        let offsetForks, pageSize = 10000;
        if (process.env.SYNC_FORK_REPOS_OFFSET_FORKS) {
            offsetForks = Number(process.env.SYNC_FORK_REPOS_OFFSET_FORKS);
        }

        if (process.env.SYNC_FORK_REPOS_PAGE_SIZE) {
            pageSize = Number(process.env.SYNC_FORK_REPOS_PAGE_SIZE);
        }

        await syncForkRepos(workerPool, conn, pageSize, offsetForks);

        // Clear worker pool.
        workerPool.clear();
    }

    // TODO: Sync rest repos by REST API.
    if (process.env.SYNC_REST_REPOS === '1') {
        // Init Worker Pool.
        const workerPool = createWorkerPool();
        const conn = createConnection(getConnectionOptions());

        // TODO

        // Clear worker pool.
        workerPool.clear();
    }

    // Sync incremental repos.
    if (process.env.SYNC_INC_REPOS === '1') {
        // Init Worker Pool.
        const workerPool = createWorkerPool();
        const conn = new ConnectionWrapper(getConnectionOptions());

        const cron = process.env.SYNC_INC_REPOS_CRON || '0 29 10 * * *';
        logger.info(`sync-repo is running on cronjob mode, schedule at: ${cron}.`);

        let limit = DEFAULT_PULL_HISTORY_REPOS_LIMIT;
        if (process.env.PULL_HISTORY_REPOS_LIMIT !== undefined) {
            limit = Number(process.env.PULL_HISTORY_REPOS_LIMIT);
        }

        let minRows = DEFAULT_PULL_HISTORY_REPOS_MIN_ROWS;
        if (process.env.PULL_HISTORY_REPOS_MIN_ROWS !== undefined) {
            minRows = Number(process.env.PULL_HISTORY_REPOS_MIN_ROWS);
        }

        schedule.scheduleJob(cron, async () => {
            const to = DateTime.utc();
            // Executed every hour to obtain the code repository with push in 1 hour.
            const from = to.minus({ hours: 1 });
            // Divide a subtask every 10 minutes so that it can be executed in parallel.
            const duration = { 'minutes': 10 };
            // The window size is set to 2 minutes.
            const step = 2;
            // Sync the fork repository and non fork repository at the same time.
            const filter = 'fork:true';

            logger.info(`Sync incremental repos from: ${from.toISO()}, to: ${to.toISO()} ...`);

            await syncRepos(workerPool, from, to, duration, step, filter);
            logger.success(`Synced incremental repos by through API.`);

            const orgReposWithLang = await pullOrgReposByTimeRangeWithLang(conn, from.toSQL(), to.toSQL());
            logger.success(`Pulled incremental ${orgReposWithLang} org repos with language from events (from: ${from.toSQL()}, to: ${to.toSQL()}).`);
    
            const personalReposWithLang = await pullPersonalReposByTimeRangeWithLang(conn, from.toSQL(), to.toSQL());
            logger.success(`Pulled incremental ${personalReposWithLang} personal repos with language  from events (from: ${from.toSQL()}, to: ${to.toSQL()}).`);

            const orgRepos = await pullOrgReposByLimit(conn, limit, minRows);
            logger.success(`Pulled incremental ${orgRepos} org repos by limit ${limit}.`);
 
            const personalRepos = await pullPersonalReposByLimit(conn, limit, minRows);
            logger.success(`Pulled ${personalRepos} personal repos by limit ${limit}.`);

            const cost = to.diffNow('minutes').minutes;
            logger.success(`Sync incremental repos from: ${from.toISO()}, to: ${to.toISO()}, cost: ${cost}`);
        });
    }
}

function createWorkerPool():Pool<JobWorker> {
    // Notice: every worker has one octokit client.
    const tokens = (process.env.SYNC_USER_GH_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (tokens.length === 0) {
        logger.error('Must provide `SYNC_USER_GH_TOKENS`.');
        process.exit();
    }
    const workerPool = createPool(new WorkerFactory(tokens), {
        min: 0,
        max: tokens.length
    }).on('factoryCreateError', function (err) {
        logger.error('factoryCreateError', err)
    }).on('factoryDestroyError', function (err) {
        logger.error('factoryDestroyError', err)
    });
    return workerPool;
}

main();
