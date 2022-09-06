import consola from "consola";
import { DateTime } from "luxon";
import { Connection } from "mysql2";
import sleep from "../../app/utils/sleep";

// Init logger.
const logger = consola.withTag('sync-repos-puller');

export async function pullRepos(conn: Connection) {
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

    // Notice: Back off day by day from the current day, because the repo name of the repository may change, 
    // we need to follow the newer one. When encountering repeated repos, we will ignore the past information 
    // through `INSERT IGNORE` statement.
    // Notice: Only PullRequestEvent type event has language field.
    if (process.env.SKIP_PULL_REPOS_WITH_LANG !== '1') {
        logger.info('Pulling GitHub repos with language field ...');
        for (let day = to; day.diff(from, 'days').get('days') >= 0; day = day.minus({ days: 1 })) {
            logger.info(`Pulling GitHub repos from events in ${day.toSQLDate()}...`);
            try {
                const orgRepos = await pullOrgReposWithLang(conn, `${day.toSQLDate()} 00:00:00`, `${day.toSQLDate()} 23:59:59`);
                logger.info(`Pulled ${orgRepos} org GitHub repos from events in ${day.toSQLDate()}.`);
    
                const personalRepos = await pullPersonalReposWithLang(conn, `${day.toSQLDate()} 00:00:00`, `${day.toSQLDate()} 23:59:59`);
                logger.info(`Pulled ${personalRepos} personal GitHub repos from events in ${day.toSQLDate()}.`);
            } catch(err: any) {
                logger.error(`Failed to pull GitHub repos from events in ${day.toSQLDate()}.`, err);
            }
            await sleep(500);
        }
    }

    if (process.env.SKIP_PULL_REPOS_WITHOUT_OTHER_FIELD !== '1') {
        logger.info('Pulling GitHub repos without other fields ...');
        for (let day = to; day.diff(from, 'days').get('days') >= 0; day = day.minus({ days: 1 })) {
            logger.info(`Pulling GitHub repos from events in ${day.toSQLDate()}...`);
            try {
                const repos = await pullPersonalReposWithoutOtherField(conn, `${day.toSQLDate()} 00:00:00`, `${day.toSQLDate()} 23:59:59`);
                logger.info(`Pulled ${repos} personal GitHub repos without language from events in ${day.toSQLDate()}.`);
            } catch(err: any) {
                logger.error(`Failed to pull GitHub repos from events in ${day.toSQLDate()}.`, err);
            }
            await sleep(500);
        }
    }
}

async function pullOrgReposWithLang(conn: Connection, from: string, to: string):Promise<number> {
    return new Promise((resolve, reject) => {
        conn.execute<any>(`
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
        ;
        `, [from, to], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows);
            }
        });
    });
}

async function pullPersonalReposWithLang(conn: Connection, from: string, to: string):Promise<number> {
    return new Promise((resolve, reject) => {
        conn.execute<any>(`
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
        ;
        `, [from, to], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows);
            }
        });
    });
}

async function pullPersonalReposWithoutOtherField(conn: Connection, from: string, to: string):Promise<number> {
    return new Promise((resolve, reject) => {
        conn.execute<any>(`
            INSERT IGNORE INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org) 
            SELECT
                repo_id,
                ANY_VALUE(repo_name) AS repo_name,
                ANY_VALUE(actor_id) AS owner_id,
                ANY_VALUE(actor_login) AS owner_login,
                0 AS owner_is_org
            FROM github_events ge
            WHERE
                type IN ('CreateEvent', 'PublicEvent')
                AND repo_id IS NOT NULL
                AND repo_name LIKE CONCAT(actor_login, "/%")
                AND actor_id IS NOT NULL
                AND actor_login IS NOT NULL
                AND created_at BETWEEN ? AND ?
            GROUP BY repo_id
        ;
        `, [from, to], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows);
            }
        });
    });
}