import consola from 'consola';
import { Pool } from 'generic-pool';
import { DateTime } from 'luxon';
import Connection from 'mysql2/typings/mysql/lib/Connection';
import { Octokit } from "octokit";
import asyncPool from 'tiny-async-pool';
import { GitHubRepo } from '.';
import { BatchLoader } from "../../app/core/BatchLoader";
import { extractOwnerAndRepo } from '../../app/utils/github';
import sleep from '../../app/utils/sleep';
import { loadGitHubRepos } from './loader';
import { JobWorker } from './worker';

const FROM_OFFSET = 10;

// Init logger.
const logger = consola.withTag('sync-repos');

export interface RepoWithForks {
    repoId: number;
    repoName: string;
    forks: number;
}

// Sync repos.

export async function syncRepos(workerPool: Pool<JobWorker>, from: DateTime, to: DateTime, step: number) {
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

    // Execute sync jobs.
    logger.info(`Handling ${timeRanges.length} subtasks with ${workerPool.max} workers.`);
    await asyncPool(workerPool.max, timeRanges, async ({ tFrom, tTo }) => {
        await extractReposForTimeRange(workerPool, tFrom, tTo, step);
        logger.success(`Finished loading repos from ${tFrom.toISO()} to ${tTo.toISO()}.`);
    });
}

async function extractReposForTimeRange(
    workerPool: Pool<JobWorker>, from: DateTime, to: DateTime, step: number
): Promise<any> {
    return new Promise((resolve, reject) => {
        workerPool.use(async (worker) => {
            const { octokit, repoLoader, repoLangLoader, repoTopicLoader } = worker; 
            let right = DateTime.fromJSDate(to.toJSDate());
            let left = right.minus({ minutes: step });

            while(true) {
                if (left.diff(from, 'seconds').seconds < FROM_OFFSET) {
                    break;
                }

                const firstRepoPushedAt = await extractRepos(octokit, repoLoader, repoLangLoader, repoTopicLoader, left, right);
                if (firstRepoPushedAt) {
                    right = firstRepoPushedAt
                    left = right.minus({ minutes: step });
                } else {
                    right = left;
                    left = right.minus({ minutes: step });
                }
            }

            resolve(true);
        });
    });
}

async function extractRepos(
    octokit: Octokit, repoLoader: BatchLoader, repoLanguageLoader: BatchLoader, repoTopicLoader: BatchLoader, 
    from: DateTime, to: DateTime
): Promise<DateTime | undefined> {
    let repoTotal = 0;
    let repoFetch = 0;
    let totalCost = 0;
    let remaining = 0;
    let firstPushedAt: DateTime | undefined;

    const fromISO = from.toISO();
    const toISO = to.toISO();
    logger.info(`Fetching search repo result for time range from ${fromISO} to ${toISO}...`);
    const queryVariable = process.env.SYNC_REPOS_GQL_QUERY;
    const variables = {
        keyword: `sort:updated-desc ${queryVariable || ''} pushed:${fromISO}..${toISO}`,
        cursor: null
    };

    const query = /* GraphQL */ `
        query ($keyword: String!, $cursor: String) {
            search(type: REPOSITORY, query: $keyword, first: 100, after: $cursor) {
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
            
            const pushedAt = DateTime.fromISO(repo.pushedAt).toUTC();
            if (
                repo.pushedAt != undefined &&
                (firstPushedAt === undefined || pushedAt.diff(firstPushedAt, 'seconds').seconds < 0) &&
                (pushedAt.diff(from, 'seconds').seconds >= 0 && pushedAt.diff(to, 'seconds').seconds <= 0)
            ) {
                firstPushedAt = pushedAt;
            }

            if (Array.isArray(repo?.languages?.edges) && process.env.SKIP_SYNC_REPO_LANGUAGES !== '1') {
                for (const { node, size } of repo?.languages?.edges) {
                    repoLanguageLoader.insert([repo.databaseId, node.name, size]);
                }
            }

            if (Array.isArray(repo?.repositoryTopics?.nodes) && process.env.SKIP_SYNC_REPO_TOPICS !== '1') {
                for (const { topic } of repo?.repositoryTopics?.nodes) {
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

    logger.success(`Fetched ${repoFetch}/${repoTotal} repos for time range from: ${fromISO}, to: ${toISO}, last_pushed_at: ${firstPushedAt}, cost: ${totalCost}, remaining: ${remaining}.`);
    return firstPushedAt;
}

// Sync fork repos.

export async function syncForkRepos(workerPool: Pool<JobWorker>, conn: Connection, pageSize: number, offsetForks?: number) {
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
                await extractForkReposForRepo(workerPool, conn, repoId, repoName, forks);
                logger.success(`Fetched fork repos for repo <${repoId}, ${repoName}> with ${forks} forks.`);
            } catch (err) {
                logger.error(`Failed to fetch fork repos for repo <${repoId}, ${repoName}> with ${forks} forks: `, err);
                sleep(1000);
            }
        });
    }
}

async function extractForkReposForRepo(workerPool: Pool<JobWorker>, conn: Connection, repoId: number, repoName: string, forks: number):Promise<void> {
    return new Promise((resolve, reject) => {
        workerPool.use(async (worker) => {
            const { octokit, repoLoader } = worker;
            logger.info(`Fetching fork repos for repo < ${repoId}, ${repoName} > with ${forks} forks...`,);
            await extractForkRepos(octokit, repoLoader, repoId, repoName);
            resolve();
        });
    });
}

async function extractForkRepos(
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
                logger.warn(`Repo ${repoName} has been disabled or removed, we can get its forks.`);
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