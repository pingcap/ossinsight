import consola from 'consola';
import * as dotenv from "dotenv";
import path from 'path';
import { createPool, Pool } from 'generic-pool';
import { DateTime } from 'luxon';
import { createConnection, Connection } from 'mysql2';
import { Octokit } from 'octokit';
import asyncPool from 'tiny-async-pool';
import { BatchLoader } from '../../app/core/BatchLoader';
import { OctokitFactory } from '../../app/core/OctokitFactory';
import { Locator, LocationCache } from '../../app/locator/Locator';
import { SyncUserLog, SyncUserMode, SyncUserRecorder } from './recorder';
import { getConnectionOptions } from '../../app/utils/db';

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

// Init logger.
const logger = consola.withTag('sync-users-data');

const BOT_LOGIN_REGEXP = /^(bot-.+|.+bot|.+\[bot\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+)$/;

enum GitHubUserType {
    ORG = 'ORG',
    USR = 'USR'
}

interface GitHubUser {
    id: number;
    login: string;
    type: GitHubUserType;
    is_bot?: boolean;
    company?: string;
    company_formatted?: string;
    address?: string;
    address_formatted?: string;
    country_code?: string;
    state?: string;
    city?: string;
    longitude?: number;
    latitude?: number;
    followers: number;
    following: number;
    createdAt: Date;
    updatedAt: Date;
    deleted?: boolean;
    refreshedAt?: Date;
}

interface RepoWithStar {
    repoId: number;
    repoName: string;
    stars: number;
}

interface KeywordWithCnt {
    prefix: string;
    cnt: number;
}

async function main() {
    // Init TiDB client.
    const conn = createConnection(getConnectionOptions());

    // Init Octokit Pool.
    const tokens = (process.env.SYNC_USER_GH_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (tokens.length === 0) {
        logger.error('Must provide `SYNC_USER_GH_TOKENS`.');
        process.exit();
    }
    const octokitPool = createPool(new OctokitFactory(tokens), {
        min: 0,
        max: tokens.length
    });
    octokitPool.on('factoryCreateError', function (err) {
        logger.error('factoryCreateError', err)
    }).on('factoryDestroyError', function (err) {
        logger.error('factoryDestroyError', err)
    });

    // Init Location Locator.
    const locationCache = new LocationCache();
    const geoLocator = new Locator(locationCache);

    // Init Users Loader.
    // TODO: Support update GitHub user data on dup. 
    const insertUserSQL = `INSERT IGNORE INTO github_users(
        id, login, type, is_bot, company, company_formatted, address_formatted, country_code, state, city, 
        longitude, latitude, followers, followings, created_at, updated_at
    ) VALUES ?`;
    const userLoader = new BatchLoader(conn, insertUserSQL, 2000);

    // Init sync user recorder.
    const syncUserRecorder = new SyncUserRecorder();

    // Prepare sync users jobs.
    const syncModes = ([process.env.SYNC_USER_FROM_REPO_STARS, process.env.SYNC_USER_FROM_USER_SEARCH]).filter((m) => m === '1');
    if (syncModes.length === 0) {
        logger.error('Must provide use at least one sync mode for syncing users.');
        process.exit();
    }
    const syncJobs:SyncUserLog[] = [];

    if (process.env.SYNC_USER_FROM_REPO_STARS === '1') {
        const start = DateTime.now();
        const repos = await getReposOrderByStars(conn);
        for (const repo of repos) {
            if (repo.repoName === undefined) continue;
            syncJobs.push({
                syncMode: SyncUserMode.SYNC_FROM_REPO_STARS,
                repoId: repo.repoId,
                repoName: repo.repoName
            });
        }
        const cost = DateTime.now().diff(start).seconds;
        logger.info(`Generated ${repos.length} sync-users jobs according to the repo stars, cost time: ${cost} s.`);
    }

    if (process.env.SYNC_USER_FROM_USER_SEARCH === '1') {
        const start = DateTime.now();
        const keywords = await getUserSearchKeywords(conn);
        for (const keyword of keywords) {
            if (keyword.prefix === undefined) continue;
            syncJobs.push({
                syncMode: SyncUserMode.SYNC_FROM_USER_SEARCH,
                keyword: keyword.prefix
            });
        }
        const cost = DateTime.now().diff(start).seconds;
        logger.info(`Generated ${keywords.length} sync-users jobs according to the user search keywords, cost time: ${cost} s.`);
    }

    // Execute sync users job in concurrently.
    const concurrent = tokens.length;
    await asyncPool(concurrent, syncJobs, async (jobData) => {
        if (jobData.syncMode === undefined) return;

        try {
            let job = await syncUserRecorder.findOne(jobData);
            if (job === undefined) {
                job = await syncUserRecorder.create(jobData);
            }

            // TODO: support focus sync users although this job has already finished.
            if (job.finishedAt !== undefined) {
                logger.info(`Skipping finished sync users job: ${JSON.stringify(jobData)}.`);
            }
            logger.info(`Running sync users job ${job.id}: `, job);

            // TODO: support more sync user mode.
            if (job.syncMode === SyncUserMode.SYNC_FROM_REPO_STARS) {
                if (job.repoName === undefined) return;
                await syncUsersFromRepoStars(octokitPool, geoLocator, userLoader, syncUserRecorder, job);
            } else if (job.syncMode === SyncUserMode.SYNC_FROM_USER_SEARCH) {
                if (job.keyword === undefined) return;
                await syncUsersFromUserSearch(octokitPool, geoLocator, userLoader, syncUserRecorder, job);
            }

            await syncUserRecorder.finish(job);
        } catch(err) {
            logger.error(`Failed to execute sync users job ${JSON.stringify(jobData)}:`, err);
        }
    });
}

// Get GitHub users from repo stars.

async function getReposOrderByStars(conn: Connection):Promise<RepoWithStar[]> {
    return new Promise((resolve, reject) => {
        const batchSize = 20000;
        // `l.repo_id IS NULL` means that the sync task for the specified repo has not been created.
        // `finishedAt IS NULL` means that the sync task for the specified repo has not been finished.
        const sql = `
        SELECT
            ge.repo_id AS repoId, ANY_VALUE(ge.repo_name) AS repoName,
            approx_count_distinct(actor_login) AS stars
        FROM github_events ge
        LEFT JOIN sync_user_logs l ON ge.repo_id = l.repo_id
        WHERE
            type = 'WatchEvent'
            AND event_year = DATE_FORMAT(NOW(), '2022-07-01')
            AND (l.repo_id IS NULL OR l.finished_at IS NULL)
        GROUP BY ge.repo_id
        HAVING stars > 100
        ORDER BY stars DESC
        LIMIT ?;
        `;

        logger.info(`Get top ${batchSize} repos order by stars ...`);
        conn.query(sql, [batchSize], (err, res) => {
            if (err != null) {
                reject(err);
            } else {
                resolve(res as RepoWithStar[]);
            }
        });
    });
}

async function syncUsersFromRepoStars(
    octokitPool: Pool<Octokit>, geoLocator: Locator, userLoader: BatchLoader, syncUserRecorder: SyncUserRecorder, 
    job: SyncUserLog
): Promise<null> {
    let { repoName, lastCursor = null } = job;
    if (repoName === undefined) {
        throw new Error('Must provide repo full name.');
    }
    if (process.env.IGNORE_LAST_CURSOR === '1') {
        lastCursor = null
    }
    const { owner, repo } = extractOwnerAndRepo(repoName);

    return new Promise((resolve, reject) => {
        octokitPool.use(async (octokit) => {
            let stargazerTotal = 0;
            let stargazerFetch = 0;
            let totalCost = 0;
            let remaining = 0;
            let page = 0;

            logger.info(`Fetching stargazers for repo: ${owner}/${repo}, last cursor: ${lastCursor} ...`);

            const variables = {
                owner: owner,
                repo: repo,
                cursor: lastCursor
            };
            const query = /* GraphQL */ `
            query($owner: String!, $repo: String!, $cursor: String) { 
                repository(owner: $owner, name: $repo) {
                    stargazers(first: 100, after: $cursor, orderBy: {field: STARRED_AT, direction: ASC}) {
                        edges {
                            node {
                                databaseId
                                login
                                name
                                company
                                location
                                followers {
                                    totalCount
                                }
                                following {
                                    totalCount
                                }
                                createdAt
                                updatedAt
                            }
                            starredAt
                        }
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                        totalCount
                    }
                }
                rateLimit {
                    cost
                    remaining
                    resetAt
                }
            }
            `;

            while(true) {
                const { repository, rateLimit } = await octokit.graphql(query, variables) as any;
                const stargazers = repository?.stargazers;

                remaining = rateLimit?.remaining;
                totalCost += rateLimit?.cost;
                stargazerTotal = stargazers?.totalCount;
                stargazerFetch += stargazers?.edges.length;
                page++;

                logger.info(`Fetch ${stargazers?.edges.length} stargazers for repo: ${owner}/${repo} page: ${page}`);

                // Load GitHub users.
                const githubUsers:GitHubUser[] = [];
                for (const stargazerEdge of stargazers.edges) {
                    const stargazer = stargazerEdge.node;
                    githubUsers.push({
                        id: stargazer.databaseId,
                        login: stargazer.login,
                        type: GitHubUserType.USR,
                        company: stargazer.company,
                        address: stargazer.location,
                        followers: stargazer.followers.totalCount,
                        following: stargazer.following.totalCount,
                        createdAt: stargazer.createdAt,
                        updatedAt: stargazer.updatedAt
                    });
                }
                loadGitHubUsers(geoLocator, userLoader, githubUsers).then((res) => {
                    logger.info(`Async load ${res} GitHub users from the stars of repo ${owner}/${repo}.`);
                });

                // Switch to next page.
                const pageInfo = stargazers?.pageInfo;

                if (job.id === undefined) {
                    logger.warn('Did not provide job ID, last cursor can be stored to the database.');
                } else {
                    syncUserRecorder.updateLastCursor(job.id, pageInfo.endCursor);
                }

                if (pageInfo?.hasNextPage === true) {
                    variables.cursor = pageInfo.endCursor;
                } else {
                    break;
                }
            }

            logger.info(`Fetched ${stargazerFetch}/${stargazerTotal} stargazers for repo: ${owner}/${repo} cost: ${totalCost} remaining: ${remaining}.`);
            // TODO: return the last cursor for next time query.
            resolve(null);
        });
    });
}

function extractOwnerAndRepo(fullName: string) {
    const parts = fullName.split("/");

    if (parts.length !== 2) {
        throw new Error(`Got a wrong repo name: ${fullName}`);
    }
    
    return {
        owner: parts[0],
        repo: parts[1]
    }
}

// Get GitHub users from user searching.

const MAX_PREFIX_LENGTH = parseInt(process.env.MAX_PREFIX_LENGTH || '8');
const MAX_SEARCH_SIZE = 1000;
const initPrefixLen = parseInt(process.env.MIN_PREFIX_LENGTH || '5');

async function getUserSearchKeywords(conn: Connection):Promise<KeywordWithCnt[]> {
    let pageSize = 20000;
    let page = 1;
    let offset = 0;
    
    let result:KeywordWithCnt[] = [];
    while (true) {
        const keywords = await getUserSearchKeywordWithLen(conn, initPrefixLen, offset, pageSize);
        logger.info(`Traveling the prefix tree with init prefixes, page ${page}`);

        if (keywords.length === 0) {
            break;
        }

        for (const keyword of keywords) {
            if (keyword.cnt < MAX_SEARCH_SIZE * 0.75) {
                logger.info(`Prefix ${keyword.prefix} has no enough sub-prefix need to travel, only ${keyword.cnt}, so skipped.`);
                result.push(keyword);
                continue;
            }

            const arr = await getUserSearchKeywordWithPrefixByPage(conn, keyword);
            result = result.concat(arr);
        }

        page++;
        offset = offset + pageSize;
    }

    result.sort((a, b) => {
        return b.cnt - a.cnt;
    });

    return result;
}

async function getUserSearchKeywordWithLen(conn: Connection, length: number, offset: number, size: number):Promise<KeywordWithCnt[]> {
    return new Promise((resolve, reject) => {
        conn.query(`
            SELECT
                SUBSTRING(login, 1, ?) AS prefix,
                COUNT(*) AS cnt
            FROM users u
            GROUP BY prefix
            ORDER BY cnt DESC
            LIMIT ?, ?
        `, [length, offset, size], (err, rows) => {
            if (err != null) {
                reject(err);
            } else {
                resolve(rows as KeywordWithCnt[]);
            }
        });
    });
}

async function getUserSearchKeywordWithPrefixByPage(conn: Connection, root: KeywordWithCnt):Promise<KeywordWithCnt[]> {
    const maxPageSize = 2000;
    let result:KeywordWithCnt[] = [];
    let offset = 0;

    if (root.prefix.length + 1 >= MAX_PREFIX_LENGTH) {
        result.push(root);
        return result;
    }

    logger.info(`Traveling the prefix tree started with prefix: '${root.prefix}' cnt: ${root.cnt} ...`);

    while (true) {
        const keywords = await getUserSearchKeywordWithPrefix(conn, root.prefix, offset, maxPageSize);
        if (keywords.length === 0) {
            break;
        }

        for (let keyword of keywords) {
            if (keyword.cnt > MAX_SEARCH_SIZE) {
                // Travel the branch.
                const branchResult = await getUserSearchKeywordWithPrefixByPage(conn, keyword);
                result = result.concat(branchResult);
            } else {
                // Push the leaf.
                result.push(keyword);
            }
        }

        offset += maxPageSize;
    }
    return result;
}

async function getUserSearchKeywordWithPrefix(conn: Connection, prefix: string, offset: number, size: number):Promise<KeywordWithCnt[]> {
    return new Promise((resolve, reject) => {
        conn.query(`
            SELECT
                SUBSTRING(login, 1, LENGTH(?) + 1) AS prefix,
                COUNT(*) AS cnt
            FROM users u
            WHERE
                login LIKE CONCAT(?, '%')
                AND LENGTH(?) + 1 <= ?
            GROUP BY prefix
            ORDER BY cnt DESC
            LIMIT ?, ?
        `, [prefix, prefix, prefix, MAX_PREFIX_LENGTH, offset, size], (err, rows) => {
            if (err != null) {
                reject(err);
            } else {
                resolve(rows as KeywordWithCnt[]);
            }
        });
    });
}

async function syncUsersFromUserSearch(
    octokitPool: Pool<Octokit>, geoLocator: Locator, userLoader: BatchLoader, syncUserRecorder: SyncUserRecorder, 
    job: SyncUserLog
): Promise<any> {
    const { keyword } = job;
    const lastCursor = null;        // Ignore the last cursor.

    if (keyword === undefined) {
        throw new Error('Must provide the keyword for user searching.');
    }

    return new Promise((resolve, reject) => {
        octokitPool.use(async (octokit) => {
            let userTotal = 0;
            let userFetch = 0;
            let totalCost = 0;
            let remaining = 0;
            let page = 0;

            logger.info(`Fetching search user result for keyword: ${keyword} ...`);

            const variables = {
                keyword: `in:login ${keyword}`,
                cursor: lastCursor
            };
            const query = /* GraphQL */ `
            query($keyword: String!, $cursor: String) { 
                search(type: USER query: $keyword first: 100 after: $cursor) {
                    userCount
                    nodes {
                        ... on Organization {
                            databaseId
                            __typename
                            login
                            name
                            location
                            createdAt
                            updatedAt
                        }
                        ... on User {
                            databaseId
                            __typename
                            login
                            name
                            company
                            location
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

            while(true) {
                const { search, rateLimit } = await octokit.graphql(query, variables) as any;

                remaining = rateLimit?.remaining;
                totalCost += rateLimit?.cost;
                userTotal = search?.userCount;
                userFetch = search?.nodes.length;
                page++;

                logger.info(`Fetch ${search?.nodes.length} user result for keyword: ${keyword}, page: ${page}`);

                // Load GitHub users.
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
                        company: user?.company,
                        address: user.location,
                        followers: user?.followers?.totalCount,
                        following: user?.following?.totalCount,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    });
                }
                loadGitHubUsers(geoLocator, userLoader, githubUsers).then((nUsers) => {
                    logger.info(`Async load ${nUsers} GitHub users from the user search for keyword ${keyword}.`);
                });

                // Switch to next page.
                const pageInfo = search?.pageInfo;

                if (job.id === undefined) {
                    logger.warn('Did not provide job ID, last cursor can be stored to the database.');
                } else {
                    syncUserRecorder.updateLastCursor(job.id, pageInfo.endCursor);
                }

                if (pageInfo?.hasNextPage === true) {
                    variables.cursor = pageInfo.endCursor;
                } else {
                    break;
                }
            }

            logger.info(`Fetched ${userFetch}/${userTotal} users for keyword: ${keyword} cost: ${totalCost} remaining: ${remaining}.`);
            resolve(true);
        });
    });
}

// Load GitHub users.

async function loadGitHubUsers(geoLocator: Locator, userLoader: BatchLoader, users: GitHubUser[]): Promise<number> {
    for (const user of users) {
        await loadGitHubUser(geoLocator, userLoader, user);
    }
    return users.length;
}

async function loadGitHubUser(geoLocator: Locator, userLoader: BatchLoader, user: GitHubUser) {
    let { id, login, type, company, address, followers, following, createdAt, updatedAt } = user;
    const isBot = BOT_LOGIN_REGEXP.test(login);
    address = trimAddress(address);
    company = trimCompanyName(company);

    // TODO: Format company name.

    // Reverse geolocation coding.
    let addressFormatted = address;
    let countryCode = null;
    let state = null;
    let city = null;
    let longitude = null;
    let latitude = null;

    if (address !== undefined && process.env.FORMAT_ADDRESS === '1') {
        const location = await geoLocator.geocode(address);
        countryCode = location?.countryCode;
        state = location?.state;
        city = location?.city;
        addressFormatted = location?.formattedAddress;
        longitude = location?.longitude;
        latitude = location?.latitude;
    }

    userLoader.insert([
        id, login, type, isBot, company, company, addressFormatted, countryCode, state, city, 
        longitude, latitude, followers, following, createdAt, updatedAt
    ]);
}

function trimCompanyName(companyName: string | undefined | null):(string | undefined) {
    if (companyName === undefined || companyName === null) return undefined;
    return companyName.trim()
}

function trimAddress(addressName?: string | undefined | null):(string | undefined) {
    if (addressName === undefined || addressName === null) return undefined;
    return addressName.trim()
}

main();