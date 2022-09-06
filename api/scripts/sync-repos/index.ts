import * as dotenv from "dotenv";
import path from 'path';
import consola from "consola";
import { getConnectionOptions } from "../../app/utils/db";
import { createConnection } from "mysql2";
import { pullRepos } from "./puller";
import { extractReposFromRepoSearch } from "./syncer";
import { createPool } from "generic-pool";
import { DateTime } from "luxon";
import asyncPool from "tiny-async-pool";
import { WorkerFactory } from "./worker";

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
    description?: string;
    primaryLanguage?: string;
    license?: string;
    size?: number;
    stars?: number;
    forks?: number;
    parentRepoId?: number;
    isFork?: boolean;
    isArchived?: boolean;
    isDeleted?: boolean;
    latestReleasedAt: Date;
    pushedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    refreshedAt?: Date;
}

async function main() {
    // Init Worker Pool.
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

    // Pull github repos from `github_events` table.
    if (process.env.PULL_HISTORY_REPOS === '1') {
        const conn = createConnection(getConnectionOptions());
        await pullRepos(conn);
    }

    // Sync repos.

    // Generate sync jobs.
    let from: DateTime, to: DateTime;
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

    // Split sync jobs.
    const timeRanges: any[] = [];
    let curr = to;
    while (curr.diff(from, 'seconds').seconds >= 0) {
        const prev = curr.minus({ 'days': 1 });
        timeRanges.push({
            tFrom: prev,
            tTo: curr
        });
        logger.debug(`Create sync job from ${prev.toISO()} to ${curr.toISO()}.`);
        curr = prev;
    }

    const concurrent = tokens.length;
    logger.info(`Handling ${timeRanges.length} subtasks with ${concurrent} concurrent.`);
    await asyncPool(concurrent, timeRanges, async ({ tFrom, tTo }) => {
        await extractReposFromRepoSearch(workerPool, tFrom, tTo);
        logger.success(`Finished loading repos from ${tFrom.toISO()} to ${tTo.toISO()}.`);
    });
}

main();