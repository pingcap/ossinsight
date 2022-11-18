import { CacheOption, CacheProvider } from "./CacheProvider";
import { OkPacket, ResultSetHeader, RowDataPacket } from "mysql2";

import {Connection} from "mysql2/promise";

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
        private readonly conn: Connection,
        private readonly tableName: string = 'cache'
    ) {}

    async set<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        key: string, value: string, options?: CacheOption
    ) {
        const EX = options?.EX || -1;
        const sql = `INSERT INTO ${this.tableName} (cache_key, cache_value, expires) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE cache_value = VALUES(cache_value), expires = VALUES(expires);`;

        return this.conn.query<T>(sql, [key, value, EX]);
    }

    async get(key: string): Promise<any> {
        const sql = `SELECT *, DATE_ADD(updated_at, INTERVAL expires SECOND) AS expired_at
        FROM ${this.tableName}
        WHERE cache_key = ? AND ((expires = -1) OR (DATE_ADD(updated_at, INTERVAL expires SECOND) >= NOW()))
        LIMIT 1;`;

        return new Promise(async (resolve, reject) => {
            try {
                const [rows] = await this.conn.query<any[]>(sql, [key]);
                if (Array.isArray(rows) && rows.length >= 1) {
                    resolve(rows[0]?.cache_value);
                } else {
                    resolve(null);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

}