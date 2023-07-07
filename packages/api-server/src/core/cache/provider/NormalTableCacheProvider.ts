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
        VALUES (?, ?, ?) AS new
        ON DUPLICATE KEY UPDATE cache_value = new.cache_value, expires = new.expires;`;

        // Execute SQL to set cache item.
        const waitConnStart = DateTime.now();
        const resultPromise = withConnection(this.pool, async (conn) => {
            const waitConnEnd = DateTime.now();
            const waitConnDuration = waitConnEnd.diff(waitConnStart).as('seconds');
            if (waitConnDuration > MAX_WAIT_CONNECTION_TIME) {
                this.logger.warn('⚠️  Wait connection for set cache <%s> cost %d s, more then %d s.', key, waitConnDuration, MAX_WAIT_CONNECTION_TIME);
            }

            return await conn.query({
                sql,
                values: [key, value, EX],
                timeout: MAX_CACHE_OPERATION_TIME * 1000
            });
        });

        // Set timeout for set cache operation.
        let timeout: NodeJS.Timeout | null = null;
        const timeoutPromise = new Promise((resolve, reject) => {
            timeout = setTimeout(() => {
                this.logger.warn('⚠️  Set cache <%s> operation timed out.', key);
                reject(new Error(`Set cache <${key}> operation timed out, more than ${MAX_CACHE_OPERATION_TIME} s.`));
            }, MAX_CACHE_OPERATION_TIME * 1000);
        });

        try {
            return Promise.race([resultPromise, timeoutPromise]);
        } finally {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        }
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
            this.shadowPool.query<any[]>(sql, [key]).then(null).catch((err) => {
                this.logger.error(err, 'Failed to get cache with key %s from shadow database.', key);
            });
        }

        // Execute SQL to get cache item.
        const waitConnStart = DateTime.now();
        const resultPromise = withConnection(this.pool, async (conn) => {
            const waitConnEnd = DateTime.now();
            const waitConnDuration = waitConnEnd.diff(waitConnStart).as('seconds');
            if (waitConnDuration > MAX_WAIT_CONNECTION_TIME) {
                this.logger.warn('⚠️  Wait connection for get cache <%s> cost %d s, more then %d s.', key, waitConnDuration, MAX_WAIT_CONNECTION_TIME);
            }

            const [rows] = await conn.query<any[]>({
                sql,
                values: [key],
                timeout: MAX_CACHE_OPERATION_TIME * 1000,
            });

            if (Array.isArray(rows) && rows.length >= 1) {
                return rows[0]?.cache_value;
            } else {
                return null;
            }
        });

        // Set timeout for get cache operation.
        let timeout: NodeJS.Timeout | null = null;
        const timeoutPromise = new Promise((resolve, reject) => {
            timeout = setTimeout(() => {
               this.logger.warn('⚠️  Get cache <%s> operation timed out, more than %d s.', key, MAX_CACHE_OPERATION_TIME);
               reject(new Error(`Get cache <${key}> operation timed out.`));
           }, MAX_CACHE_OPERATION_TIME * 1000);
        });

        try {
            return Promise.race([resultPromise, timeoutPromise]);
        } finally {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        }
    }

}
