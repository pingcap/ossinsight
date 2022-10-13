import async from 'async';
import consola from 'consola';
import { Pool } from 'generic-pool';
import { DateTime, DurationLike } from 'luxon';
import Connection from 'mysql2/typings/mysql/lib/Connection';
import { Octokit } from "octokit";
import asyncPool from 'tiny-async-pool';
import { BatchLoader } from "../../app/core/BatchLoader";
import { extractOwnerAndRepo } from '../../app/utils/github';
import sleep from '../../app/utils/sleep';
import { splitTimeRange } from '../../app/utils/times';
import { loadGitHubRepos, WorkerPayload } from './loader';
import { GitHubRepo } from './types';
import { JobWorker } from '../../app/core/GenericJobWorkerPool';

// Init logger.
const logger = consola.withTag('sync-repos');

enum TimeRangeFiled {
    CREATED = 'created',
    PUSHED = 'pushed'
}

// Sync repos.
export async function syncReposInConcurrent(
    workerPool: Pool<JobWorker<WorkerPayload>>, timeRangeField: TimeRangeFiled, from: DateTime, to: DateTime, chunkSize: DurationLike, stepSize: number, 
    filter: string | null, skipSyncRepoLanguages: boolean, skipSyncRepoTopics: boolean
) {
    // Workers ready.
    const concurrent = workerPool.max;
    const queue = async.queue(async ({ tFrom, tTo }) => {
        logger.info(`Handle time range from ${tFrom} to ${tTo}.`);
        try {
            const worker = await workerPool.acquire();
            const { octokit, payload } = worker; 
            const { repoLoader, repoLangLoader, repoTopicLoader } = payload!;
            let left = DateTime.fromJSDate(tFrom.toJSDate());
            let right = left.plus(stepSize);

            while(true) {
                if (right.diff(tTo, 'seconds').seconds > 10) {
                    break;
                }

                const moreThan1k = await extractReposForTimeRange(
                    octokit, repoLoader, repoLangLoader, repoTopicLoader, timeRangeField, left, right, filter,
                    skipSyncRepoLanguages, skipSyncRepoTopics
                );
                if (moreThan1k) {
                    if (right.diff(left, 'seconds').seconds <= 1) {
                        right = left.plus({ seconds: 1 });
                    } else {
                        // Reduce the current step size to half of the original.
                        right = left.plus({
                            seconds: right.diff(left, 'seconds').seconds / 2
                        });
                    }
                } else {
                    left = right
                    right = right.plus(stepSize);
                }
            }
            workerPool.release(worker);
            logger.success(`Finished loading repos from ${tFrom.toISO()} to ${tTo.toISO()}.`);
        } catch (err) {
            logger.error(`Finished loading repos from ${tFrom.toISO()} to ${tTo.toISO()}.`);
        }
    }, concurrent);

    // Split sync jobs.
    const timeRanges = splitTimeRange(from, to, chunkSize);

    // Dispatch sync jobs.
    logger.info(`Handling ${timeRanges.length} subtasks with ${concurrent} workers.`);
    for (const timeRange of timeRanges) {
        queue.pushAsync(timeRange);
    }

    // Wait for the workers finished all the jobs.
    await queue.drain();
}

async function extractReposForTimeRange(
    octokit: Octokit, repoLoader: BatchLoader, repoLanguageLoader: BatchLoader, repoTopicLoader: BatchLoader, 
    timeRangeField: TimeRangeFiled, from: DateTime, to: DateTime, filter: string | null, skipSyncRepoLanguages: boolean, 
    skipSyncRepoTopics: boolean
): Promise<boolean> {
    let repoTotal = 0;
    let repoFetch = 0;
    let totalCost = 0;
    let remaining = 0;

    const fromISO = from.toISO();
    const toISO = to.toISO();
    const variables = {
        q: `${filter || ''} ${timeRangeField}:${fromISO}..${toISO}`,
        cursor: null
    };
    logger.info(`Fetching search repo result for time range from ${fromISO} to ${toISO}...`);

    const query = /* GraphQL */ `
        query ($q: String!, $cursor: String) {
            search(type: REPOSITORY, query: $q, first: 100, after: $cursor) {
                repositoryCount
                nodes {
                    ... on Repository {
                        databaseId
                        owner {
                            ... on User {
                                databaseId
                                login
                                __typename
                            }
                            ... on Organization {
                                databaseId
                                login
                                __typename
                            }
                        }
                        nameWithOwner
                        licenseInfo {
                            key
                        }
                        isInOrganization
                        isFork
                        isArchived
                        description
                        primaryLanguage {
                            name
                        }
                        diskUsage
                        stargazerCount
                        forkCount
                        latestRelease {
                            createdAt
                        }
                        pushedAt
                        createdAt
                        updatedAt
                        languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
                            edges {
                                node {
                                    name
                                }
                                size
                            }
                        }
                        repositoryTopics(first: 20) {
                            nodes {
                                topic {
                                    name
                                }
                            }
                        }
                        parent {
                            databaseId
                        }
                    }
                }
                pageInfo {
                    startCursor
                    hasNextPage
                    endCursor
                }
            }
            rateLimit {
                limit
                cost
                remaining
                resetAt
            }
        }
    `;

    while(true) {
        let search, rateLimit;

        try {
            const res = await octokit.graphql(query, variables) as any;
            search = res.search
            rateLimit = res.rateLimit
        } catch (err: any) {
            logger.error(`Failed to fetch repos: `, variables, err);
            logger.info(err.message, err.response);
            continue;
        }

        remaining = rateLimit?.remaining;
        totalCost += rateLimit?.cost;
        repoTotal = search?.repositoryCount;
        repoFetch += search?.nodes.length;

        if (repoTotal > 1000) {
            return true;
        }

        // Load GitHub repos.
        const githubRepos:GitHubRepo[] = [];
        for (const repo of search?.nodes) {
            githubRepos.push({
                repoId: repo.databaseId,
                repoName: repo.nameWithOwner,
                ownerId: repo?.owner?.databaseId,
                ownerLogin: repo.owner?.login,
                ownerIsOrg: repo.isInOrganization,
                description: repo?.description,
                primaryLanguage: repo?.primaryLanguage?.name,
                license: repo?.licenseInfo?.key,
                size: repo.diskUsage,
                stars: repo.stargazerCount,
                forks: repo.forkCount,
                parentRepoId: repo?.parent?.databaseId,
                isFork: repo.isFork,
                isArchived: repo.isArchived,
                latestReleasedAt: repo?.latestRelease?.createdAt,
                pushedAt: repo.pushedAt,
                createdAt: repo.createdAt,
                updatedAt: repo.updatedAt
            });

            const repoLanguages = repo?.languages?.edges;
            if (Array.isArray(repoLanguages) && !skipSyncRepoLanguages) {
                for (const { node, size } of repoLanguages) {
                    repoLanguageLoader.insert([repo.databaseId, node.name, size]);
                }
            }

            const repoTopics = repo?.repositoryTopics?.nodes;
            if (Array.isArray(repoTopics) && !skipSyncRepoTopics) {
                for (const { topic } of repoTopics) {
                    repoTopicLoader.insert([repo.databaseId, topic.name]);
                }
            }
        }
        loadGitHubRepos(repoLoader, githubRepos);

        // Switch to next page.
        const pageInfo = search?.pageInfo;

        if (pageInfo?.hasNextPage === true) {
            variables.cursor = pageInfo.endCursor;
        } else {
            break;
        }
    }

    logger.success(`Fetched ${repoFetch}/${repoTotal} repos for time range from: ${fromISO}, to: ${toISO}, cost: ${totalCost}, remaining: ${remaining}.`);
    return false;
}

// Sync fork repos.

export interface RepoWithForks {
    repoId: number;
    repoName: string;
    forks: number;
}

// TODO: use async queue instead of asyncPool.
export async function syncForkRepos(
    workerPool: Pool<JobWorker<WorkerPayload>>, conn: Connection, pageSize: number, offsetForks?: number
) {
    while (true) {
        logger.info(`Getting repos with offset ${offsetForks} and page size ${pageSize}.`);
        const repos = await getTopNonForkRepos(conn, pageSize, offsetForks);

        if (!Array.isArray(repos) || repos.length === 0) {
            break;
        }
        const minForks = repos[0].forks;
        const maxForks = repos[repos.length - 1].forks;
        offsetForks = maxForks;

        logger.success(`Got non-forks repos with most forks (from: ${maxForks}, to: ${minForks}).`);

        // Execute sync jobs.
        logger.info(`Handling ${repos.length} subtasks with ${workerPool.max} workers.`);
        await asyncPool(workerPool.max, repos, async (repo) => {
            const { repoId, repoName, forks } = repo;

            try {
                await extractForkReposInConcurrent(workerPool, conn, repoId, repoName, forks);
                logger.success(`Fetched fork repos for repo <${repoId}, ${repoName}> with ${forks} forks.`);
            } catch (err) {
                logger.error(`Failed to fetch fork repos for repo <${repoId}, ${repoName}> with ${forks} forks: `, err);
                sleep(1000);
            }
        });
    }
}

async function extractForkReposInConcurrent(workerPool: Pool<JobWorker<WorkerPayload>>, conn: Connection, repoId: number, repoName: string, forks: number):Promise<void> {
    return new Promise((resolve, reject) => {
        workerPool.use(async (worker) => {
            const { octokit, payload } = worker;
            const { repoLoader } = payload!;
            logger.info(`Fetching fork repos for repo < ${repoId}, ${repoName} > with ${forks} forks...`,);
            await extractForkReposForTimeRange(octokit, repoLoader, repoId, repoName);
            resolve();
        });
    });
}

async function extractForkReposForTimeRange(
    octokit: Octokit, repoLoader: BatchLoader, repoId: number, repoName: string
): Promise<void> {
    let repoFetch = 0;
    let totalCost = 0;
    let remaining = 0;

    const { owner, repo } = extractOwnerAndRepo(repoName);
    const variables = {
        owner: owner,
        repo: repo,
        cursor: null
    };

    const query = /* GraphQL */ `
        query ($owner: String!, $repo: String!, $cursor: String) {
            repository(owner: $owner, name:$repo) {
                forks(first: 100, orderBy: {field: CREATED_AT, direction: ASC}, after: $cursor) {
                    nodes {
                        databaseId
                        owner {
                        ... on User {
                            databaseId
                            login
                            __typename
                        }
                        ... on Organization {
                            databaseId
                            login
                            __typename
                        }
                        }
                        nameWithOwner
                        licenseInfo {
                            key
                        }
                        isInOrganization
                        isFork
                        isArchived
                        description
                        primaryLanguage {
                            name
                        }
                        diskUsage
                        stargazerCount
                        forkCount
                        latestRelease {
                            createdAt
                        }
                        pushedAt
                        createdAt
                        updatedAt
                        parent {
                            databaseId
                        }
                    }
                    pageInfo {
                        startCursor
                        hasNextPage
                        endCursor
                    }
                }
            }
            rateLimit {
                limit
                cost
                remaining
                resetAt
            }
        }
    `;

    while(true) {
        let forks, rateLimit;

        try {
            const res = await octokit.graphql(query, variables) as any;
            if (res.repository === null) {
                logger.warn(`Repo ${repoName} has been disabled or removed, we can't get its forks.`);
                break;
            }

            forks = res.repository?.forks
            rateLimit = res.rateLimit
        } catch (err: any) {
            logger.error(`Failed to fetch repos: `, variables, err);
            logger.info(err.message, err.response);
            continue;
        }

        remaining = rateLimit?.remaining;
        totalCost += rateLimit?.cost;
        repoFetch += forks?.nodes.length;

        // Load GitHub repos.
        const githubRepos:GitHubRepo[] = [];
        for (const repo of forks?.nodes) {
            githubRepos.push({
                repoId: repo.databaseId,
                repoName: repo.nameWithOwner,
                ownerId: repo?.owner?.databaseId,
                ownerLogin: repo.owner?.login,
                ownerIsOrg: repo.isInOrganization,
                description: repo?.description,
                primaryLanguage: repo?.primaryLanguage?.name,
                license: repo?.licenseInfo?.key,
                size: repo.diskUsage,
                stars: repo.stargazerCount,
                forks: repo.forkCount,
                parentRepoId: repo?.parent?.databaseId,
                isFork: repo.isFork,
                isArchived: repo.isArchived,
                latestReleasedAt: repo?.latestRelease?.createdAt,
                pushedAt: repo.pushedAt,
                createdAt: repo.createdAt,
                updatedAt: repo.updatedAt
            });
        }
        loadGitHubRepos(repoLoader, githubRepos);

        // Switch to next page.
        const pageInfo = forks?.pageInfo;

        if (pageInfo?.hasNextPage === true) {
            variables.cursor = pageInfo.endCursor;
        } else {
            break;
        }
    }

    logger.success(`Fetched ${repoFetch} forks for repo < ${repoId}, ${repoName} >, cost: ${totalCost}, remaining: ${remaining}.`);
}

async function getTopNonForkRepos(conn: Connection, pageSize: number, offsetForks?: number): Promise<RepoWithForks[]> {
    const sql = `
        SELECT repo_id AS repoId, repo_name AS repoName, forks
        FROM github_repos
        WHERE
            forks IS NOT NULL
            AND forks > 0
            ${offsetForks ? `AND forks <= ${offsetForks}` : ''}
        ORDER BY forks DESC
        LIMIT ${pageSize}
    `;

    return new Promise((resolve, reject) => {
        conn.query(sql, (err: any, rows: RepoWithForks[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}