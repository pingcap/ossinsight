import consola, { Consola } from "consola";
import { Connection, createConnection } from "mysql2";


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
        this.dbClient = createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '4000'),
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            decimalNumbers: true,
            timezone: 'Z'
        });
    }

    async findOne(job: SyncUserLog):Promise<SyncUserLog | undefined> {
        return new Promise((resolve, reject) => {
            switch(job.syncMode) {
                case SyncUserMode.SYNC_FROM_REPO_STARS:
                    if (job.repoId === undefined) {
                        reject('must provide repoId')
                    }
                    break;
                case SyncUserMode.SYNC_FROM_USER_SEARCH:
                    if (job.keyword === undefined) {
                        reject('must provide keyword')
                    }
                    break;
                case SyncUserMode.SYNC_FROM_REPO_FOLLOWERS:
                    if (job.userId === undefined) {
                        reject('must provide userId')
                    }
                    break;
                default:
                    resolve(undefined);
                    return;
            }

            const q = this.dbClient.query(`
                SELECT
                    id, sync_mode AS syncMode,
                    repo_id AS repo_id, repo_name AS repoName,
                    user_id AS userId, user_login AS userLogin, 
                    keyword,
                    started_at AS startedAt, finished_at AS finishedAt
                FROM
                    sync_user_logs
                WHERE
                    sync_mode = ?
                    AND (
                        (sync_mode = ? AND repo_id = ?) OR
                        (sync_mode = ? AND keyword = ?) OR
                        (sync_mode = ? AND user_id = ?)
                    )
                ORDER BY started_at DESC
                LIMIT 1
            `, [
                job.syncMode,
                SyncUserMode.SYNC_FROM_REPO_STARS, (job.repoId || 0), 
                SyncUserMode.SYNC_FROM_USER_SEARCH, (job.keyword || ''),
                SyncUserMode.SYNC_FROM_REPO_FOLLOWERS, (job.userLogin || '')
            ], (err, rows: any[]) => {
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