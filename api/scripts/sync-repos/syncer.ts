import async from 'async';
import consola from 'consola';
import { Pool as GenericPool } from 'generic-pool';
import { DateTime, DurationLike } from 'luxon';
import { Octokit } from "octokit";
import { BatchLoader } from "../../app/core/BatchLoader";
import { splitTimeRange } from '../../app/utils/times';
import { loadGitHubRepo, loadGitHubRepos, WorkerPayload } from './loader';
import { GitHubRepo } from './types';
import { JobWorker } from '../../app/core/GenericJobWorkerPool';
import { Pool, ResultSetHeader } from 'mysql2/promise';
import { extractOwnerAndRepo } from '../../app/utils/github';

// Init logger.
const logger = consola.withTag('sync-repos');

enum TimeRangeFiled {
    CREATED = 'created',
    PUSHED = 'pushed'
}

// Sync repos in batch.
export async function syncReposInBatch(
    workerPool: GenericPool<JobWorker<WorkerPayload>>, timeRangeField: TimeRangeFiled, from: DateTime, to: DateTime, chunkSize: DurationLike, stepSize: number, 
    filter: string | null, skipSyncRepoLanguages: boolean, skipSyncRepoTopics: boolean
) {
    // Workers ready.
    const concurrent = workerPool.max;
    const queue = async.queue(async ({ tFrom, tTo }) => {
        logger.info(`Handle time range from ${tFrom} to ${tTo}.`);
        const worker = await workerPool.acquire();
        try {
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

            logger.success(`Finished loading repos from ${tFrom.toISO()} to ${tTo.toISO()}.`);
        } catch (err) {
            logger.error(`Failed to load repos from ${tFrom.toISO()} to ${tTo.toISO()}.`);
        } finally {
            workerPool.release(worker);
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

// Sync repos in concurrent.
export async function syncReposInConcurrent(
    workerPool: GenericPool<JobWorker<WorkerPayload>>, connections: Pool, sql: string,
    skipSyncRepoLanguages: boolean, skipSyncRepoTopics: boolean
) {
    // Workers ready.
    const concurrent = workerPool.max;
    const queue = async.queue(async ({ repoId, repoName }) => {
        const worker = await workerPool.acquire();
        try {
            const { octokit, payload, pool } = worker; 
            const { repoLoader, repoLangLoader, repoTopicLoader } = payload!;

            await extractRepoInfoByGraphQL(
                octokit, pool, repoLoader, repoLangLoader, repoTopicLoader, repoId, repoName, 
                skipSyncRepoLanguages, skipSyncRepoTopics
            );
        } catch (err) {
            logger.error(`Failed to load repo with name ${repoName}:`, err);
        } finally {
            workerPool.release(worker);
        }
    }, concurrent);

    // Dispatch sync jobs.
    while (true) {
        if (queue.started) {
            await queue.unsaturated();
        }

        try {
            logger.info(`Fetch repos...`);
            const [repos] = await connections.query<any>(`${sql}`);
            
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
            logger.error(`Failed to fetch repos:`, err);
            throw err;
        }
    }

    // Wait for the workers finished all the jobs.
    await queue.drain();
}

async function extractRepoInfoByGraphQL(
    octokit: Octokit, connections: Pool, repoLoader: BatchLoader, repoLanguageLoader: BatchLoader, repoTopicLoader: BatchLoader, 
    repoId: string, repoName: string, skipSyncRepoLanguages: boolean, skipSyncRepoTopics: boolean
): Promise<void> {
    const { owner, repo: name } = extractOwnerAndRepo(repoName);
    const variables = {
        owner: owner,
        name: name
    };
    const query = /* GraphQL */ `
        query ($owner: String!, $name: String!) {
            repository(owner: $owner name: $name) {
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
            rateLimit {
                limit
                cost
                remaining
                resetAt
            }
            }
    `;

    try {
        const { repository: repo, rateLimit } = await octokit.graphql(query, variables) as any;
        const { cost, remaining } = rateLimit;

        // Notice: Check if there are more than one repo with the same repo name.
        // If the repo ids in the database is different from the one fetched from API, marked those repos as deleted.
        if (repoId != repo.databaseId) {
            await markDeletedRepoByRepoName(connections, repoName, repo.databaseId);
        }

        // Load GitHub repo.
        loadGitHubRepo(repoLoader, {
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

        logger.success(`Synced repo ${repoName}, cost: ${cost}, remaining: ${remaining}.`);
    } catch (err: any) {
        if (typeof err.message === 'string' && err.message.includes('Could not resolve to a Repository with the name')) {
            await markDeletedRepoByRepoName(connections, repoName);
        } else {
            logger.error(`Failed to fetch repo: ${JSON.stringify(variables)}: `, err);
        }
    }
}

async function markDeletedRepoByRepoName(connections: Pool, repoName: string, excludeRepoId?: number) {
    const [rs] = await connections.query<ResultSetHeader>(`
        UPDATE github_repos SET is_deleted = 1, refreshed_at = NOW() WHERE repo_name = ? AND repo_id != ?
    `, [repoName, excludeRepoId]);
    if (rs.affectedRows === 1) {
        logger.success(`Marked repo ${repoName} as deleted${excludeRepoId ? ` (exclude repo id: ${excludeRepoId})` : ''}.`);
    }
}