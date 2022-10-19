import consola from "consola";
import { DateTime } from "luxon";
import { Pool, ResultSetHeader } from "mysql2/promise";
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
 * through `INSERT ... ON DUPLICATE KEY UPDATE repo_name = repo_name` statement.
 * 
 * Notice: Only `PullRequestEvent` type event has language field.
 * 
 * @param pool Database connection pool.
 * @param from Start time of scanning pull request events.
 * @param to End time of scanning pull request events.
 * 
 */
export async function pullReposWithLang(pool: Pool, from: DateTime, to: DateTime) {
    logger.info('Pulling GitHub repos with language field ...');
    for (let day = to; day.diff(from, 'days').get('days') >= 0; day = day.minus({ days: 1 })) {
        logger.info(`Pulling GitHub repos from events in ${day.toSQLDate()}...`);
        try {
            const orgRepos = await pullOrgReposByTimeRangeWithLang(pool, `${day.toSQLDate()} 00:00:00`, `${day.toSQLDate()} 23:59:59`);
            logger.info(`Pulled ${orgRepos} org GitHub repos from events in ${day.toSQLDate()}.`);

            const personalRepos = await pullPersonalReposByTimeRangeWithLang(pool, `${day.toSQLDate()} 00:00:00`, `${day.toSQLDate()} 23:59:59`);
            logger.info(`Pulled ${personalRepos} personal GitHub repos from events in ${day.toSQLDate()}.`);
        } catch(err: any) {
            logger.error(`Failed to pull GitHub repos from events in ${day.toSQLDate()}.`, err);
        }
        await sleep(500);
    }
}

export async function pullOrgReposByTimeRangeWithLang(pool: Pool, from: string, to: string):Promise<number> {
    const [rs] = await pool.execute<ResultSetHeader>(`
        INSERT INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, primary_language, last_event_at) 
        SELECT
            repo_id,
            repo_name,
            org_id AS owner_id,
            org_login AS owner_login,
            1 AS owner_is_org,
            language AS primary_language,
            MAX(created_at) AS max_created_at
        FROM github_events ge
        WHERE
            type = 'PullRequestEvent'
            AND repo_id IS NOT NULL
            AND repo_id != 0
            AND repo_name IS NOT NULL
            AND repo_name != ''
            AND org_id IS NOT NULL
            AND org_id != 0
            AND org_login IS NOT NULL
            AND org_login != ''
            AND created_at BETWEEN ? AND ?
        GROUP BY repo_id, repo_name, org_id, org_login, language
        ON DUPLICATE KEY UPDATE last_event_at = GREATEST(max_created_at, last_event_at)
    ;`, [from, to]);
    return rs.affectedRows;
}

export async function pullPersonalReposByTimeRangeWithLang(pool: Pool, from: string, to: string):Promise<number> {
    const [rs] = await pool.execute<any>(`
        INSERT INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, primary_language, last_event_at) 
        SELECT
            repo_id,
            repo_name AS repo_name,
            actor_id AS owner_id,
            actor_login AS owner_login,
            0 AS owner_is_org,
            language AS primary_language,
            MAX(created_at) AS max_created_at
        FROM github_events ge
        WHERE
            type = 'PullRequestEvent'
            AND repo_id IS NOT NULL
            AND repo_id != 0
            AND repo_name LIKE CONCAT(actor_login, "/%")
            AND actor_id IS NOT NULL
            AND actor_id != 0
            AND actor_login IS NOT NULL
            AND actor_login != ''
            AND created_at BETWEEN ? AND ?
        GROUP BY repo_id, repo_name, actor_id, actor_login, language
        ON DUPLICATE KEY UPDATE last_event_at = GREATEST(max_created_at, last_event_at)
    ;`, [from, to]);
    return rs.affectedRows;
}

/**
 * Pull history repositories without from `github_events` table.
 * 
 * @param pool Database connection pool.
 * @param limit Limit how much data is imported each time.
 * @param minRows Stop importing when the number of imported rows is less than the specified number.
 * 
 */
export async function pullReposWithoutLang(pool: Pool, limit: number, minRows: number) {
    // Org repos.
    const orgRepos = await pullOrgReposByLimit(pool, limit, minRows);
    logger.success(`Successfully pulled ${orgRepos} org repos by limit ${limit}.`);

    // Personal repos.
    const personalRepos = await pullPersonalReposByLimit(pool, limit, minRows);
    logger.success(`Successfully pulled ${personalRepos} personal repos by limit ${limit}.`);
}

export async function pullOrgReposByLimit(pool: Pool, limit: number, minRows: number):Promise<number> {
    let i = 1;
    let total = 0;
    while (true) {
        logger.info(`Pulling org repos by limit ${limit} (round ${i}) ...`);
        const [rs] = await pool.execute<any>(`
            INSERT INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, last_event_at) 
            SELECT
                ge.repo_id,
                ge.repo_name AS repo_name,
                ge.org_id AS owner_id,
                ge.org_login AS owner_login,
                1 AS owner_is_org,
                MAX(created_at) AS max_created_at
            FROM github_events ge
            LEFT JOIN github_repos r ON ge.repo_id = r.repo_id
            WHERE
                ge.repo_id IS NOT NULL
                AND ge.repo_id != 0
                AND ge.repo_name IS NOT NULL
                AND ge.repo_name != ''
                AND ge.org_id IS NOT NULL
                AND ge.repo_id != 0
                AND ge.org_login IS NOT NULL
                AND ge.repo_name != ''
                AND r.repo_id IS NULL
            ON DUPLICATE KEY UPDATE last_event_at = GREATEST(max_created_at, last_event_at)
            LIMIT ?
        ;`, [limit]);
        const affectedRows = rs.affectedRows;
        logger.success(`Pulled ${affectedRows} org repos by limit ${limit} (round ${i}).`);

        if (affectedRows === undefined || affectedRows < minRows) {
            break
        } else {
            total += affectedRows;
            i++;
        }
    }
    return total;
}

export async function pullPersonalReposByLimit(pool: Pool, limit: number, minRows: number):Promise<number> {
    let i = 1;
    let total = 0;
    while (true) {
        const [rs] = await pool.execute<any>(`
            INSERT INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, last_event_at) 
            SELECT
                ge.repo_id,
                ge.repo_name AS repo_name,
                ge.actor_id AS owner_id,
                ge.actor_login AS owner_login,
                0 AS owner_is_org,
                MAX(created_at) AS max_created_at
            FROM github_events ge
            LEFT JOIN github_repos r ON ge.repo_id = r.repo_id
            WHERE
                ge.repo_id IS NOT NULL
                AND ge.repo_id != 0
                AND ge.repo_name LIKE CONCAT(ge.actor_login, "/%")
                AND ge.actor_id IS NOT NULL
                AND ge.actor_id != 0
                AND ge.actor_login IS NOT NULL
                AND ge.actor_login != ''
                AND r.repo_id IS NULL
            ON DUPLICATE KEY UPDATE last_event_at = GREATEST(max_created_at, last_event_at)
            LIMIT ?
        ;`, [limit]);
        const affectedRows = rs.affectedRows;
        logger.success(`Pulled ${affectedRows} personal repos by limit ${limit} (round ${i}).`);

        if (affectedRows === undefined || affectedRows < minRows) {
            break
        } else {
            total += affectedRows;
            i++;
        }
    }
    return total;
}