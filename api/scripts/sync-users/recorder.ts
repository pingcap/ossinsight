import consola, { Consola } from "consola";
import { Connection, createConnection } from "mysql2";
import { getConnectionOptions } from "../../app/utils/db";

export enum SyncUserMode {
    SYNC_FROM_REPO_STARS = 1,
    SYNC_FROM_USER_SEARCH = 2,
    SYNC_FROM_REPO_FOLLOWERS = 3,
}

export interface SyncUserLog {
    id?: number;
    syncMode: SyncUserMode;
    repoId?: number;
    repoName?: string;
    userId?: number;
    userLogin?: string;
    keyword?: string;
    lastCursor?: string;
    startedAt?: Date;
    finishedAt?: Date;
}

export class SyncUserRecorder {
    private logger: Consola;
    private dbClient: Connection;

    constructor() {
        // Init logger.
        this.logger = consola.withTag('sync-user-recorder');

        // Init TiDB client.
        this.dbClient = createConnection(getConnectionOptions());
    }

    async findOne(job: SyncUserLog):Promise<SyncUserLog | undefined> {
        return new Promise((resolve, reject) => {
            let where = '';
            switch(job.syncMode) {
                case SyncUserMode.SYNC_FROM_REPO_STARS:
                    if (job.repoId === undefined && job.repoName === undefined) {
                        reject('must provide repoId or repoName')
                    }
                    where = `WHERE sync_mode = ${SyncUserMode.SYNC_FROM_REPO_STARS} AND (repo_id = ${job.repoId} OR repo_name = '${job.repoName}')`;
                    break;
                case SyncUserMode.SYNC_FROM_USER_SEARCH:
                    if (job.keyword === undefined) {
                        reject('must provide keyword')
                    }
                    where = `WHERE sync_mode = ${SyncUserMode.SYNC_FROM_USER_SEARCH} AND keyword = '${job.keyword}'`;
                    break;
                case SyncUserMode.SYNC_FROM_REPO_FOLLOWERS:
                    if (job.userId === undefined && job.userLogin === undefined) {
                        reject('must provide userId or userLogin')
                    }
                    where = `WHERE sync_mode = ${SyncUserMode.SYNC_FROM_REPO_FOLLOWERS} AND (user_id = ${job.userId} OR user_login = '${job.userLogin}')`;
                    break;
                default:
                    resolve(undefined);
                    return;
            }

            this.dbClient.query(`
                SELECT
                    id, sync_mode AS syncMode,
                    repo_id AS repo_id, repo_name AS repoName,
                    user_id AS userId, user_login AS userLogin, 
                    keyword,
                    last_cursor AS lastCursor,
                    started_at AS startedAt, finished_at AS finishedAt
                FROM
                    sync_user_logs
                ${where}
                ORDER BY started_at DESC
                LIMIT 1
            `, (err, rows: any[]) => {
                if (err) {
                    reject(new Error(`[${err.errno}] ${err.code} ${err.message}`, { cause: err }));
                } else {
                    if (Array.isArray(rows) && rows.length >= 1) {
                        resolve(rows[0]);
                    } else {
                        resolve(undefined);
                    }
                }
            });
        });
    }

    async create(job: SyncUserLog):Promise<SyncUserLog> {
        return new Promise((resolve, reject) => {
            const {
                syncMode, repoId = null, repoName = null, userId = null, userLogin = null, 
                keyword = null, finishedAt = null
            } = job;
            this.dbClient.execute(`
                INSERT INTO sync_user_logs(
                    sync_mode, repo_id, repo_name, user_id, user_login, keyword, finished_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?
                );
            `,
            [syncMode, repoId, repoName, userId, userLogin, keyword, finishedAt],
            (err, res: any) => {
                if (err) {
                    reject(new Error(`[${err.errno}] ${err.code} ${err.message}`, { cause: err }));
                } else {
                    // Reference: https://github.com/mysqljs/mysql#getting-the-id-of-an-inserted-row
                    job.id = res.insertId;
                    resolve(job);
                }
            });
        });
    }

    async updateLastCursor(jobId: number, lastCursor: string):Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.dbClient.execute(`
                UPDATE sync_user_logs SET last_cursor = ? WHERE id = ?;
            `,
            [lastCursor, jobId],
            (err, res: any) => {
                if (err) {
                    reject(new Error(`[${err.errno}] ${err.code} ${err.message}`, { cause: err }));
                } else {
                    resolve(true);
                }
            });
        });
    }

    async finish(job: SyncUserLog):Promise<boolean> {
        return new Promise((resolve, reject) => {
            const jobID = job.id;
            this.dbClient.execute('UPDATE sync_user_logs SET finished_at = NOW() WHERE id = ?',
            [jobID],
            (err, res: any) => {
                if (err) {
                    reject(new Error(`[${err.errno}] ${err.code} ${err.message}`, { cause: err }));
                } else {
                    resolve(true);
                }
            });
        });
    }


}