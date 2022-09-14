import consola from "consola";
import { DateTime } from "luxon";
import { ConnectionWrapper } from "../../app/utils/db";
import sleep from "../../app/utils/sleep";

const DEFAULT_PULL_HISTORY_REPOS_LIMIT = 1000;
const DEFAULT_PULL_HISTORY_REPOS_END_COUNT = 10;

// Init logger.
const logger = consola.withTag('sync-repos-puller');

export async function pullRepos(conn: ConnectionWrapper) {
    // Notice: Back off day by day from the current day, because the repo name of the repository may change, 
    // we need to follow the newer one. When encountering same repos, we will skip update the repo information 
    // through `INSERT IGNORE` statement.

    let from, to;
    if (process.env.PULL_HISTORY_REPOS_FROM === undefined) {
        from = DateTime.utc(2011, 2, 12);
    } else {
        from = DateTime.fromSQL(process.env.PULL_HISTORY_REPOS_FROM)
    }

    if (process.env.PULL_HISTORY_REPOS_TO === undefined) {
        to = DateTime.utc();
    } else {
        to = DateTime.fromSQL(process.env.PULL_HISTORY_REPOS_TO)
    }

    // Notice: Only PullRequestEvent type event has language field.
    if (process.env.SKIP_PULL_REPOS_WITH_LANG !== '1') {
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

    let limit = DEFAULT_PULL_HISTORY_REPOS_LIMIT;
    if (process.env.PULL_HISTORY_REPOS_LIMIT !== undefined) {
        limit = Number(process.env.PULL_HISTORY_REPOS_LIMIT)
    }

    let endCount = DEFAULT_PULL_HISTORY_REPOS_END_COUNT;
    if (process.env.PULL_HISTORY_REPOS_END_COUNT !== undefined) {
        endCount = Number(process.env.PULL_HISTORY_REPOS_END_COUNT)
    }

    if (process.env.SKIP_PULL_REPOS_WITHOUT_LANG !== '1') {
        // Org repos.
        let i = 1;
        let total = 0;
        while (true) {
            logger.info(`Pulling org repos by limit ${limit} (round ${i}) ...`);
            const repos = await pullOrgReposByLimit(conn, limit);
            logger.success(`Pulled ${repos} org repos by limit ${limit} (round ${i}).`);

            if (repos === undefined || repos < endCount) {
                break;
            } else {
                total += repos;
                i++;
            }
        }
        logger.success(`Successfully pulled ${total} org repos by limit ${limit} in ${i} rounds.`);

        // Personal repos.
        i = 1;
        total = 0;
        while (true) {
            logger.info(`Pulling personal repos by limit ${limit} (round ${i}) ...`);
            const repos = await pullPersonalReposByLimit(conn, limit);
            logger.success(`Pulled ${repos} personal repos by limit ${limit} (round ${i}).`);

            if (repos === undefined || repos < endCount) {
                break;
            } else {
                total += repos;
                i++;
            }
        }
        logger.success(`Successfully pulled ${total} personal repos by limit ${limit} in ${i} rounds.`);
    }
}

// Pull org repos.

async function pullOrgReposByTimeRangeWithLang(conn: ConnectionWrapper, from: string, to: string):Promise<number> {
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

async function pullOrgReposByLimit(conn: ConnectionWrapper, limit: number):Promise<number> {
    try {
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
        return res.result.affectedRows;
    } catch (err) {
        throw err;
    }
}

// Pull personal repos.

async function pullPersonalReposByTimeRangeWithLang(conn: ConnectionWrapper, from: string, to: string):Promise<number> {
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

async function pullPersonalReposByLimit(conn: ConnectionWrapper, limit: number):Promise<number> {
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
        return res.result.affectedRows;
    } catch (err) {
        throw err;
    }
}