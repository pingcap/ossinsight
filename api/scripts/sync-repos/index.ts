import * as dotenv from "dotenv";
import path from 'path';
import consola from "consola";
import { getConnectionOptions } from "../../app/utils/db";
import { createConnection } from "mysql2";
import { pullRepos } from "./puller";
import { syncForkRepos, syncRepos } from "./syncer";
import { createPool, Pool } from "generic-pool";
import { DateTime } from "luxon";
import { JobWorker, WorkerFactory } from "./worker";

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
        const conn = createConnection(getConnectionOptions());
        await pullRepos(conn);
    }

    // Sync repos by GitHub API.
    if (process.env.SYNC_REPOS === '1') {
        // Init Worker Pool.
        const workerPool = createWorkerPool();

        // Generate sync jobs.
        let from: DateTime, to: DateTime, step: number;
        if (process.env.SYNC_HISTORY_REPOS_FROM === undefined) {
            from = DateTime.utc(2011, 2, 12);
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

        await syncRepos(workerPool, from, to, step);

        // Clear worker pool.
        workerPool.clear();
    }

    // Sync fork repos by GitHub API.
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