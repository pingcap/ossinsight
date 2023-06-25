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

        // Execute SQL to set cache item.
        const waitConnStart = DateTime.now();
        return await withConnection(this.pool, async (conn) => {
            const waitConnEnd = DateTime.now();
            const waitConnDuration = waitConnEnd.diff(waitConnStart).as('seconds');
            if (waitConnDuration > 3) {
                this.logger.warn('⚠️ Wait connection for set cache <%s> cost %d s, more then 3 s.', key, waitConnDuration);
            }

            const start = DateTime.now();
            try {
                return await conn.query({
                    sql,
                    values: [key, value, EX],
                    timeout: 10000,
                });
            } finally {
                const end = DateTime.now();
                const duration = end.diff(start).as('seconds');
                if (duration > 10) {
                    this.logger.warn('⚠️ Set cache <%s> cost %d s, more then 10 s.', key, duration);
                }
            }
        });
    }

    async get(key: string): Promise<any> {
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
        return await withConnection(this.pool, async (conn) => {
            const waitConnEnd = DateTime.now();
            const waitConnDuration = waitConnEnd.diff(waitConnStart).as('seconds');
            if (waitConnDuration > 3) {
                this.logger.warn('⚠️ Wait connection for get cache <%s> cost %d s, more then 3 s.', key, waitConnDuration);
            }

            const start = DateTime.now();
            try {
                const [rows] = await conn.query<any[]>({
                    sql,
                    values: [key],
                    timeout: 10000,
                });

                if (Array.isArray(rows) && rows.length >= 1) {
                    return rows[0]?.cache_value;
                } else {
                    return null;
                }
            } finally {
                const end = DateTime.now();
                const duration = end.diff(start).as('seconds');
                if (duration > 10) {
                    this.logger.warn('⚠️ Get cache <%s> cost %d s, more then 10 s.', key, duration);
                }
            }
        });
    }

}