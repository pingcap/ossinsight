import async from "async";
import { Consola } from "consola";
import { Pool as GenericPool } from "generic-pool";
import { Connection, Pool, ResultSetHeader } from "mysql2/promise";
import { Octokit } from "octokit";
import { JobWorker } from "../../app/core/GenericJobWorkerPool";

const GET_OWNER_HAVE_MOST_REPOS_SQL = `
SELECT
    owner_id AS ownerId,
    owner_login AS ownerLogin,
    owner_is_org AS ownerIsOrg,
    COUNT(1) AS repos
FROM github_repos
WHERE is_deleted = 0 AND created_at = 0
GROUP BY owner_id, owner_login, owner_is_org
ORDER BY repos DESC
LIMIT ?, ?
`;

const MARK_DELETED_REPO_SQL = `
UPDATE github_repos
SET is_deleted = 1
WHERE is_deleted = 0 AND created_at = 0 AND owner_id = ? 
LIMIT ?
`;

const MARK_DELETED_REPO_WITH_EXCLUDE_SQL = `
UPDATE github_repos
SET is_deleted = 1
WHERE is_deleted = 0 AND created_at = 0 AND owner_id = ? AND repo_id NOT IN (?)
LIMIT ?
`;

const COUNT_OWNER_IDS_SQL = `
SELECT distinct owner_id AS owner_id FROM github_repos WHERE owner_login = ?;
`;

interface OwnerWithRepos {
    ownerId: number,
    ownerLogin: string;
    repos: number;
}

export async function markDeletedRepos(logger: Consola, workers: GenericPool<JobWorker<void>>, connections: Pool, publicReposLimit: number) {
    // Prepare workers.
    const concurrent = workers.max;
    const queue = async.queue<OwnerWithRepos>(async ({ ownerId, ownerLogin, repos: ownedRepos }) => {
        const worker = await workers.acquire();
        const { octokit, pool } = worker;
        const conn = await pool.getConnection();

        // Check if the user has been deleted.
        try {
            const res = await octokit.rest.users.getByUsername({
                username: ownerLogin
            });
            const { id: userId, login: userLogin, type, public_repos } = res.data;
            const ownerIsOrg = type === 'Organization';

            // Notice: It is important!
            if (userId !== ownerId) {
                logger.warn(`The id of user with login ${ownerLogin} is different, user id: ${userId}, owner id: ${ownerId}.`);
                return;
            } else if (userLogin !== ownerLogin) {
                logger.warn(`The login of user is ${userLogin}, which is different from owner login ${ownerLogin}.`);
                return;
            }

            if (public_repos > publicReposLimit) {
                logger.info(`Skip id <${ownerId}> and owner <${ownerLogin}>, cause has too much public repos (${public_repos}).`);
            } else {
                // Found all repos of the user.
                let actualRepos: number[] = [];
                actualRepos = await getUserOrOrgRepos(octokit, ownerLogin, ownerIsOrg);
                logger.info(
                    `Handle id <${ownerId}> and owner <${ownerLogin}>, who actually has ${actualRepos.length} repos, but owned ${ownedRepos} repos.`
                );

                // Marked all not-found repos of the user as deleted.
                const markedRepos = await markedUserOrOrgDeletedRepos(conn, logger, ownerId, ownerLogin, actualRepos);
                logger.success(`Marked ${markedRepos} repos as deleted for login ${ownerLogin}.`);
            }
        } catch (err: any) {
            const message: string = err.message;
            if (!message.includes('Not Found')) {
                logger.error(`Failed to handle owner with id <${ownerId}> and login <${ownerLogin}>.`, err);
                return
            }

            // Notice: We can't judge from this that the user does not exist. He may just change the login.
            try {
                const [rows] = await conn.query<any>(COUNT_OWNER_IDS_SQL, [ownerLogin]);
                if (rows.length !== 1) {
                    logger.warn(`Skip id <${ownerId}> and owner <${ownerLogin}> has ${rows?.length} owner ids`);
                    return
                }

                // Marked all repos of the not-found user as deleted.
                const markedRepos = await markedUserOrOrgDeletedRepos(conn, logger, ownerId, ownerLogin);
                logger.success(`Marked ${markedRepos} repos as deleted for login ${ownerLogin} (deleted).`);
            } catch(err) {
                logger.error(`Failed to handle deleted owner ${ownerLogin}.`);
            }
        } finally {
            await workers.release(worker);
            await conn.release();
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

async function getUserOrOrgRepos(octokit: Octokit, ownerLogin: string, ownerIsOrg: boolean):Promise<number[]> {
    let repoIterator;
    if (ownerIsOrg) {
        repoIterator = await octokit.paginate.iterator(octokit.rest.repos.listForOrg, {
            org: ownerLogin
        });
    } else {
        repoIterator = await octokit.paginate.iterator(octokit.rest.repos.listForUser, {
            username: ownerLogin
        });
    }

    const repoIds:number[] = [];
    for await (const repo of repoIterator) {
        repo.data.forEach((r) => {
            repoIds.push(r.id);
        });
    }

    return repoIds;
}

async function markedUserOrOrgDeletedRepos(conn: Connection, logger: Consola, ownerId: number, ownerLogin: string, excludeRepoIds?: number[]) {
    const batchSize = 10000;
    let markedRepos = 0;

    try {
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
                logger.debug(`Updated ${rs.affectedRows} repos for owner with id ${ownerId} and login ${ownerLogin}`);
                markedRepos += rs.affectedRows
            }
        }
    } catch(err) {
        logger.error('Failed to updated deleted repos:', err);
    }

    return markedRepos;
}