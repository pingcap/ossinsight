import consola from 'consola';
import { Pool } from 'generic-pool';
import { DateTime } from 'luxon';
import { Octokit } from "octokit";
import { GitHubRepo } from '.';
import { BatchLoader } from "../../app/core/BatchLoader";
import { loadGitHubRepos } from './loader';
import { JobWorker } from './worker';

// Init logger.
const logger = consola.withTag('sync-repos-extract');

const STEP_MINUTE = 5;
const FROM_OFFSET = 10;

export async function extractReposFromRepoSearch(
    workerPool: Pool<JobWorker>, from: DateTime, to: DateTime
): Promise<any> {
    return new Promise((resolve, reject) => {
        workerPool.use(async (worker) => {
            const { octokit, repoLoader, repoLangLoader, repoTopicLoader } = worker; 
            let right = DateTime.fromJSDate(to.toJSDate());
            let left = right.minus({ minutes: STEP_MINUTE });

            while(true) {
                if (left.diff(from, 'seconds').seconds < FROM_OFFSET) {
                    break;
                }

                const firstRepoPushedAt = await extractRepos(octokit, repoLoader, repoLangLoader, repoTopicLoader, left, right);
                if (firstRepoPushedAt) {
                    right = firstRepoPushedAt
                    left = right.minus({ minutes: STEP_MINUTE });
                } else {
                    right = left;
                    left = right.minus({ minutes: STEP_MINUTE });
                }
            }

            resolve(true);
        });
    });
}

export async function extractRepos(
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

    const variables = {
        keyword: `sort:updated-desc pushed:${fromISO}..${toISO}`,
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

            if (Array.isArray(repo?.languages?.edges)) {
                for (const { node, size } of repo?.languages?.edges) {
                    repoLanguageLoader.insert([repo.databaseId, node.name, size]);
                }
            }

            if (Array.isArray(repo?.repositoryTopics?.nodes)) {
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