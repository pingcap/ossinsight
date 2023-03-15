import async from "async";
import consola from "consola";
import { Pool } from "generic-pool";
import { DateTime, DurationLike } from "luxon";
import { Octokit } from "octokit";
import { BatchLoader } from "../../app/core/BatchLoader";
import { splitTimeRange } from "../../app/utils/times";
import { JobWorker } from "../../app/core/GenericJobWorkerPool";
import { loadGitHubUsers, WorkerPayload } from "./loader";
import { GitHubUser, GitHubUserType } from "./types";

// Init logger.
const logger = consola.withTag('sync-users');

// Get GitHub users from user searching.
const SEARCH_USERS_BY_TIME_RANGE_GQL = /* GraphQL */ `
    query($q: String!, $cursor: String) { 
        search(type: USER query: $q first: 100 after: $cursor) {
            userCount
            nodes {
                ... on Organization {
                    databaseId
                    __typename
                    login
                    name
                    email
                    location
                    repositories {
                        totalCount
                    }
                    createdAt
                    updatedAt
                }
                ... on User {
                    databaseId
                    __typename
                    login
                    name
                    email
                    company
                    location
                    repositories {
                        totalCount
                    }
                    followers {
                        totalCount
                    }
                    following {
                        totalCount
                    }
                    createdAt
                    updatedAt
                }
            }
            pageInfo {
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

export async function syncUsersFromTimeRangeSearch(
    workerPool: Pool<JobWorker<WorkerPayload>>, from: DateTime, to: DateTime,
    chunkSize: DurationLike, stepSize: DurationLike, filter?: string
) {
    // Workers ready.
    const concurrent = workerPool.max;
    const queue = async.queue(async ({ tFrom, tTo }) => {
        logger.info(`Handle time range from ${tFrom} to ${tTo}.`);
        try {
            const worker = await workerPool.acquire();
            const { octokit, payload } = worker; 
            const { userLoader } = payload!;
            let left = DateTime.fromJSDate(tFrom.toJSDate());
            let right = left.plus(stepSize);

            while(true) {
                if (right.diff(tTo, 'seconds').seconds > 10) {
                    break;
                }

                // Notice: The GitHub search results can return up to 1k records. If a query is found there are 
                // more than 1k records need to be obtained, it will halve the user's search time range.
                const moreThan1k = await extractUsersForTimeRange(octokit, userLoader, left, right, filter);
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
            logger.success(`Finished loading users from ${tFrom.toISO()} to ${tTo.toISO()}.`);
        } catch (err) {
            logger.error(`Finished loading users from ${tFrom.toISO()} to ${tTo.toISO()}.`);
        }
    }, concurrent);

    // Split sync jobs.
    const timeRanges = splitTimeRange(from, to, chunkSize);

    // Dispatch sync jobs.
    logger.info(`Handling ${timeRanges.length} subtasks with ${concurrent} workers.`);
    for (const timeRange of timeRanges) {
        queue.pushAsync(timeRange);
    }

    // Wait for the workers finished all the jobs.å
    await queue.drain();
}

async function extractUsersForTimeRange(
    octokit: Octokit, userLoader: BatchLoader, from: DateTime, to: DateTime, filter?: string
): Promise<boolean> {
    let userTotal = 0;
    let userFetch = 0;
    let totalCost = 0;
    let remaining = 0;

    const fromISO = from.toISO();
    const toISO = to.toISO();
    const variables = {
        q: `${filter || ''} created:${fromISO}..${toISO}`,
        cursor: null
    };
    logger.info(`Fetching search user result for time range from ${fromISO} to ${toISO}...`);

    while(true) {
        let search, rateLimit;

        try {
            const res = await octokit.graphql(SEARCH_USERS_BY_TIME_RANGE_GQL, variables) as any;
            search = res.search
            rateLimit = res.rateLimit
        } catch (err: any) {
            logger.error(`Failed to fetch users: `, variables, err);
            logger.info(err.message, err.response);
            continue;
        }

        remaining = rateLimit?.remaining;
        totalCost += rateLimit?.cost;
        userTotal = search?.userCount;
        userFetch += search?.nodes.length;

        if (userTotal > 1000) {
            return true;
        }

        // Load GitHub repos.
        const githubUsers:GitHubUser[] = [];
        for (const user of search?.nodes) {
            let userType = GitHubUserType.USR;
            if (user.__typename === 'Organization') {
                userType = GitHubUserType.ORG;
            }

            githubUsers.push({
                id: user.databaseId,
                login: user.login,
                type: userType,
                name: user?.name,
                email: user?.email,
                organization: user?.company,
                address: user.location,
                public_repos: user?.repositories?.totalCount,
                followers: user?.followers?.totalCount,
                following: user?.following?.totalCount,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            });
        }
        loadGitHubUsers(userLoader, githubUsers);

        // Switch to next page.
        const pageInfo = search?.pageInfo;
        if (pageInfo?.hasNextPage === true) {
            variables.cursor = pageInfo.endCursor;
        } else {
            break;
        }
    }

    logger.success(`Fetched ${userFetch}/${userTotal} users for time range from: ${fromISO}, to: ${toISO}, cost: ${totalCost}, remaining: ${remaining}.`);
    return false;
}
