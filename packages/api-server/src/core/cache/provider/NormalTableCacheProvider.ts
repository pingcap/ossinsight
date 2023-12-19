import {DateTime} from "luxon";
import {OkPacket, ResultSetHeader, RowDataPacket} from "mysql2";

import {Pool} from "mysql2/promise";
import pino from "pino";
import {withConnection} from "../../../utils/db";
import {CacheOption, CacheProvider} from "./CacheProvider";

// Table schema:
//
// CREATE TABLE `cache` (
//     `cache_key` varchar(512) NOT NULL,
//     `cache_value` json NOT NULL,
//     `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     `expires` int(11) DEFAULT '-1' COMMENT 'cache will expire after n seconds',
//     PRIMARY KEY (`cache_key`) /*T![clustered_index] CLUSTERED */
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
//

export const MAX_WAIT_CONNECTION_TIME = 3;  // 3 seconds.
export const MAX_CACHE_OPERATION_TIME = 10; // 10 seconds.

export default class NormalTableCacheProvider implements CacheProvider {

    constructor(
      private readonly logger: pino.Logger,
      private readonly pool: Pool,
      private readonly shadowPool?: Pool,
      private readonly tableName: string = 'cache'
    ) {}

    async set<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        key: string, value: string, options?: CacheOption
    ) {
        const EX = options?.EX || -1;
        const sql = `INSERT INTO ${this.tableName} (cache_key, cache_value, expires) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE cache_value = VALUES(cache_value), expires = VALUES(expires);`;

        return new Promise(async (resolve, reject) => {
            // Set timeout for set cache operation.
            let timeout: NodeJS.Timeout = setTimeout(() => {
                reject(new Error(`Set cache <${key}> operation timed out, more than ${MAX_CACHE_OPERATION_TIME} s.`));
            }, MAX_CACHE_OPERATION_TIME * 1000);

            // Execute SQL to set cache item.
            try {
                const waitConnStart = DateTime.now();
                const res = await withConnection(this.pool, async (conn) => {
                    const waitConnEnd = DateTime.now();
                    const waitConnDuration = waitConnEnd.diff(waitConnStart).as('seconds');
                    if (waitConnDuration > MAX_WAIT_CONNECTION_TIME) {
                        this.logger.warn('⚠️ Wait connection for set cache <%s> cost %d s, more than %d s.', key, waitConnDuration, MAX_WAIT_CONNECTION_TIME);
                    }

                    const setStart = DateTime.now();
                    const res = await conn.query({
                        sql,
                        values: [key, value, EX],
                        timeout: MAX_CACHE_OPERATION_TIME * 1000
                    });
                    const setEnd = DateTime.now();
                    const setDuration = setEnd.diff(setStart).as('seconds');
                    this.logger.info(`✅️ Finished cache setting for query <%s> in %d s.`, key, setDuration);
                    if (setDuration > MAX_CACHE_OPERATION_TIME) {
                        this.logger.warn(`⚠️ Cache setting for query <%s> is slow, took %d s, more than %d s.`, key, setDuration, MAX_CACHE_OPERATION_TIME);
                    }

                    return res;
                });
                resolve(res);
            } catch (err) {
                reject(err);
            } finally {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout.unref();
                }
            }
        });
    }

    async get(key: string) {
        const sql = `SELECT *, DATE_ADD(updated_at, INTERVAL expires SECOND) AS expired_at
        FROM ${this.tableName}
        WHERE
            cache_key = ? AND (
                (expires = -1) OR
                (DATE_ADD(updated_at, INTERVAL expires SECOND) >= NOW())
            )
        LIMIT 1;`;

        // Execute query in shadow database.
        if (this.shadowPool) {
            this.shadowPool.query<any[]>({
                sql,
                values: [key],
                timeout: MAX_CACHE_OPERATION_TIME * 1000
            }).then(null).catch((err) => {
                this.logger.error(err, 'Failed to getting cache with key %s from shadow database.', key);
            });
        }

        return new Promise(async (resolve, reject) => {
            // Set timeout for get cache operation.
            let timeout: NodeJS.Timeout | null = setTimeout(() => {
                reject(new Error(`Get cache <${key}> operation timed out, more than ${MAX_CACHE_OPERATION_TIME} s.`));
            }, MAX_CACHE_OPERATION_TIME * 1000);

            // Execute SQL to get cache item.
            try {
                const waitConnStart = DateTime.now();
                const res = await withConnection(this.pool, async (conn) => {
                    const waitConnEnd = DateTime.now();
                    const waitConnDuration = waitConnEnd.diff(waitConnStart).as('seconds');
                    if (waitConnDuration > MAX_WAIT_CONNECTION_TIME) {
                        this.logger.warn('⚠️  Wait connection for getting cache <%s> cost %d s, more than %d s.', key, waitConnDuration, MAX_WAIT_CONNECTION_TIME);
                    }

                    const getStart = DateTime.now();
                    const [rows] = await conn.query<any[]>({
                        sql,
                        values: [key],
                        timeout: MAX_CACHE_OPERATION_TIME * 1000,
                    });
                    const getEnd = DateTime.now();
                    const getDuration = getEnd.diff(getStart).as('seconds');
                    this.logger.info(`✅️ Finished cache getting for query <%s> in %d s.`, key, getDuration);
                    if (getDuration > MAX_CACHE_OPERATION_TIME) {
                        this.logger.warn(`⚠️ Cache getting for query <%s> is slow, took %d s, more than %d s.`, key, getDuration, MAX_CACHE_OPERATION_TIME);
                    }

                    if (Array.isArray(rows) && typeof rows?.[0]?.cache_value === 'object') {
                        return rows[0].cache_value;
                    } else {
                        return null;
                    }
                });
                resolve(res);
            } catch (err) {
                reject(err);
            } finally {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
            }
        });
    }

}
