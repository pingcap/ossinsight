import async from "async";
import { Consola } from "consola";
import { Pool as GenericPool } from "generic-pool";
import { Pool, ResultSetHeader } from "mysql2/promise";
import { Octokit } from "octokit";
import { JobWorker } from "../../app/core/GenericJobWorkerPool";

const GET_OWNER_HAVE_MOST_REPOS_SQL = `
SELECT
    owner_id AS ownerId,
    ANY_VALUE(owner_login) AS ownerLogin,
    ANY_VALUE(owner_is_org) AS ownerIsOrg,
    COUNT(1) AS repos
FROM github_repos
WHERE is_deleted = 0
GROUP BY owner_id
ORDER BY repos DESC
LIMIT ?, ?
`;

const MARK_DELETED_REPO_SQL = `
UPDATE github_repos
SET is_deleted = 1
WHERE is_deleted = 0 AND owner_id = ?
LIMIT ?
`;

const MARK_DELETED_REPO_WITH_EXCLUDE_SQL = `
UPDATE github_repos
SET is_deleted = 1
WHERE is_deleted = 0 AND owner_id = ? AND repo_id NOT IN (?)
LIMIT ?
`;

interface OwnerWithRepos {
    ownerId: number,
    ownerLogin: string;
    ownerIsOrg: number;
    repos: number;
}

export async function markDeletedRepos(logger: Consola, workers: GenericPool<JobWorker<void>>, connections: Pool) {
    // Prepare workers.
    const concurrent = workers.max;
    const queue = async.queue<OwnerWithRepos>(async ({ ownerId, ownerLogin, ownerIsOrg, repos: ownedRepos }) => {
        const worker = await workers.acquire();
        const { octokit, pool } = worker;

        // Check if the user has been deleted.
        try {
            const res = await octokit.rest.users.getByUsername({
                username: ownerLogin
            });
            const { id, login, type, public_repos } = res.data;
            logger.info(`Handle user with login ${login}: ${JSON.stringify({ id, login, type, public_repos })}`);

            if (public_repos > 2000) {
                logger.warn(`User/Org with login ${login} has too much public repos, skipped it.`);
            } else {
                // Found all repos of the user.
                let excludeRepoIds: number[] = [];
                excludeRepoIds = await getUserOrOrgRepos(octokit, ownerLogin, ownerIsOrg);
                logger.info(
                    `Found user/org with login ${ownerLogin} actually has ${excludeRepoIds.length} repos, who has owned ${ownedRepos} repos.`
                );

                const markedRepos = await markedUserOrOrgDeletedRepos(pool, logger, ownerId, ownerLogin, excludeRepoIds);
                logger.success(`Marked ${markedRepos} repos as deleted for login ${ownerLogin}.`);
            }
        } catch (err: any) {
            const message: string = err.message;
            if (message.includes('Not Found')) {
                // Marked all repos of this login as deleted.
                logger.info(`User/Org with login ${ownerLogin} has been deleted in GitHub, so we marked all of his repos as deleted.`);
                const markedRepos = await markedUserOrOrgDeletedRepos(pool, logger, ownerId, ownerLogin);
                logger.success(`Marked ${markedRepos} repos as deleted for login ${ownerLogin}.`);
            } else {
                logger.error(`Failed to get user/org info for login ${ownerLogin}: `, err);
            }
        } finally {
            await workers.release(worker);
        }
    }, concurrent);

    // Generate jobs.
    let page = 1, size = 1000;
    while(true) {
        const offset = (page - 1) * size;
        const [owners] = await connections.query<any[]>(GET_OWNER_HAVE_MOST_REPOS_SQL, [offset, size]);

        if (!Array.isArray(owners) || owners.length === 0) {
            break;
        }

        // Enqueue.
        for (const owner of owners) {
            queue.push(owner);
        }
        await queue.empty();

        page++;
    }

    await queue.drain();
}

async function getUserOrOrgRepos(octokit: Octokit, ownerLogin: string, ownerIsOrg: number):Promise<number[]> {
    let repoIterator;
    if (ownerIsOrg === 0) {
        repoIterator = await octokit.paginate.iterator(octokit.rest.repos.listForUser, {
            username: ownerLogin
        });
    } else {
        repoIterator = await octokit.paginate.iterator(octokit.rest.repos.listForOrg, {
            org: ownerLogin
        });
    }

    const excludeRepoIds:number[] = [];
    for await (const repo of repoIterator) {
        repo.data.forEach((r) => {
            excludeRepoIds.push(r.id);
        });
    }

    return excludeRepoIds;
}

async function markedUserOrOrgDeletedRepos(pool: Pool, logger: Consola, ownerId: number, ownerLogin: string, excludeRepoIds?: number[]) {
    const batchSize = 10000;
    let markedRepos = 0;
    let conn;
    
    try {
        conn = await pool.getConnection();
        while (true) {
            let rs:ResultSetHeader;
            if (Array.isArray(excludeRepoIds) && excludeRepoIds.length > 0) {
                const res = await conn.query<ResultSetHeader>(MARK_DELETED_REPO_WITH_EXCLUDE_SQL, [ownerId, excludeRepoIds, batchSize]);
                rs = res[0];
            } else {
                const res = await conn.query<ResultSetHeader>(MARK_DELETED_REPO_SQL, [ownerId, batchSize]);
                rs = res[0];
            }

            if (rs.affectedRows === 0) {
                break
            } else {
                logger.info(`Updated ${rs.affectedRows} repos for owner with id ${ownerId} and login ${ownerLogin}`);
                markedRepos += rs.affectedRows
            }
        }
    } catch(err) {
        logger.error('Failed to updated deleted repos:', err);
    } finally {
        if (conn) {
            conn.release();
        }
    }

    return markedRepos;
}