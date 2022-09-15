import consola from "consola";
import { DateTime } from "luxon";
import { ConnectionWrapper } from "../../app/utils/db";
import sleep from "../../app/utils/sleep";

export const DEFAULT_PULL_HISTORY_REPOS_LIMIT = 10000;
export const DEFAULT_PULL_HISTORY_REPOS_MIN_ROWS = 10;

// Init logger.
const logger = consola.withTag('sync-repos-puller');

/**
 * Pull history repositories with language from `github_events` table.
 * 
 * Notice: Back off day by day from the current day, because the repo name of the repository may change, 
 * we need to follow the newer one. When encountering same repos with different name, we will skip update the repo information 
 * through `INSERT IGNORE` statement.
 * 
 * Notice: Only `PullRequestEvent` type event has language field.
 * 
 * @param conn Database Connection.
 * @param from Start time of scanning pull request events.
 * @param to End time of scanning pull request events.
 * 
 */
export async function pullReposWithLang(conn: ConnectionWrapper, from: DateTime, to: DateTime) {
    logger.info('Pulling GitHub repos with language field ...');
    for (let day = to; day.diff(from, 'days').get('days') >= 0; day = day.minus({ days: 1 })) {
        logger.info(`Pulling GitHub repos from events in ${day.toSQLDate()}...`);
        try {
            const orgRepos = await pullOrgReposByTimeRangeWithLang(conn, `${day.toSQLDate()} 00:00:00`, `${day.toSQLDate()} 23:59:59`);
            logger.info(`Pulled ${orgRepos} org GitHub repos from events in ${day.toSQLDate()}.`);

            const personalRepos = await pullPersonalReposByTimeRangeWithLang(conn, `${day.toSQLDate()} 00:00:00`, `${day.toSQLDate()} 23:59:59`);
            logger.info(`Pulled ${personalRepos} personal GitHub repos from events in ${day.toSQLDate()}.`);
        } catch(err: any) {
            logger.error(`Failed to pull GitHub repos from events in ${day.toSQLDate()}.`, err);
        }
        await sleep(500);
    }
}

export async function pullOrgReposByTimeRangeWithLang(conn: ConnectionWrapper, from: string, to: string):Promise<number> {
    try {
        const res = await conn.execute<any>(`
            INSERT IGNORE INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, language) 
            SELECT
                repo_id,
                ANY_VALUE(repo_name) AS repo_name,
                ANY_VALUE(org_id) AS owner_id,
                ANY_VALUE(org_login) AS owner_login,
                1 AS owner_is_org,
                ANY_VALUE(language) AS language
            FROM github_events ge
            WHERE
                type = 'PullRequestEvent'
                AND repo_id IS NOT NULL
                AND repo_name IS NOT NULL
                AND org_id IS NOT NULL
                AND org_login IS NOT NULL
                AND created_at BETWEEN ? AND ?
            GROUP BY repo_id
        ;`, [from, to]);
        return res.result.affectedRows;
    } catch (err) {
        throw err;
    }
}

export async function pullPersonalReposByTimeRangeWithLang(conn: ConnectionWrapper, from: string, to: string):Promise<number> {
    try {
        const res = await conn.execute<any>(`
            INSERT IGNORE INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, language) 
            SELECT
                repo_id,
                ANY_VALUE(repo_name) AS repo_name,
                ANY_VALUE(actor_id) AS owner_id,
                ANY_VALUE(actor_login) AS owner_login,
                0 AS owner_is_org,
                ANY_VALUE(language) AS language
            FROM github_events ge
            WHERE
                type = 'PullRequestEvent'
                AND repo_id IS NOT NULL
                AND repo_name LIKE CONCAT(actor_login, "/%")
                AND actor_id IS NOT NULL
                AND actor_login IS NOT NULL
                AND created_at BETWEEN ? AND ?
            GROUP BY repo_id
        ;`, [from, to]);
        return res.result.affectedRows;
    } catch (err) {
        throw err;
    }
}

/**
 * Pull history repositories without from `github_events` table.
 * 
 * @param conn Database Connection.
 * @param limit Limit how much data is imported each time.
 * @param minRows Stop importing when the number of imported rows is less than the specified number.
 * 
 */
export async function pullReposWithoutLang(conn: ConnectionWrapper, limit: number, minRows: number) {
    // Org repos.
    const orgRepos = await pullOrgReposByLimit(conn, limit, minRows);
    logger.success(`Successfully pulled ${orgRepos} org repos by limit ${limit}.`);

    // Personal repos.
    const personalRepos = await pullPersonalReposByLimit(conn, limit, minRows);
    logger.success(`Successfully pulled ${personalRepos} personal repos by limit ${limit}.`);
}

export async function pullOrgReposByLimit(conn: ConnectionWrapper, limit: number, minRows: number):Promise<number> {
    let i = 1;
    let total = 0;
    while (true) {
        try {
            logger.info(`Pulling org repos by limit ${limit} (round ${i}) ...`);
            const res = await conn.execute<any>(`
                INSERT IGNORE INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org) 
                SELECT
                    ge.repo_id,
                    ge.repo_name AS repo_name,
                    ge.org_id AS owner_id,
                    ge.org_login AS owner_login,
                    1 AS owner_is_org
                FROM github_events ge
                LEFT JOIN github_repos r ON ge.repo_id = r.repo_id
                WHERE
                    ge.repo_id IS NOT NULL
                    AND ge.repo_name IS NOT NULL
                    AND ge.org_id IS NOT NULL
                    AND ge.org_login IS NOT NULL
                    AND r.repo_id IS NULL
                LIMIT ?
            ;`, [limit]);
            const affectedRows = res.result?.affectedRows;
            logger.success(`Pulled ${affectedRows} org repos by limit ${limit} (round ${i}).`);

            if (affectedRows === undefined || affectedRows < minRows) {
                break
            } else {
                total += affectedRows;
                i++;
            }
        } catch (err) {
            throw err;
        }
    }
    return total;
}

export async function pullPersonalReposByLimit(conn: ConnectionWrapper, limit: number, minRows: number):Promise<number> {
    let i = 1;
    let total = 0;
    while (true) {
        try {
            const res = await conn.execute<any>(`
                INSERT IGNORE INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org) 
                SELECT
                    ge.repo_id,
                    ge.repo_name AS repo_name,
                    ge.actor_id AS owner_id,
                    ge.actor_login AS owner_login,
                    0 AS owner_is_org
                FROM github_events ge
                LEFT JOIN github_repos r ON ge.repo_id = r.repo_id
                WHERE
                    ge.repo_id IS NOT NULL
                    AND ge.repo_name LIKE CONCAT(ge.actor_login, "/%")
                    AND ge.actor_id IS NOT NULL
                    AND ge.actor_login IS NOT NULL
                    AND r.repo_id IS NULL
                LIMIT ?
            ;`, [limit]);
            const affectedRows = res.result?.affectedRows;
            logger.success(`Pulled ${affectedRows} personal repos by limit ${limit} (round ${i}).`);

            if (affectedRows === undefined || affectedRows < minRows) {
                break
            } else {
                total += affectedRows;
                i++;
            }
        } catch (err) {
            throw err;
        }
    }
    return total;
}