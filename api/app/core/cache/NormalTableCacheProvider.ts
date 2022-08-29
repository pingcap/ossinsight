import consola from "consola";
import { Connection, Pool } from "mysql2";
import { CacheOption, CacheProvider } from "./CacheProvider";

const logger = consola.withTag('normal-table-cache')

export default class NormalTableCacheProvider implements CacheProvider {

    constructor(
        private readonly connPool: Pool
    ) {}

    async set(key: string, value: string, options?: CacheOption): Promise<void> {
        const EX = options?.EX || -1;
        const sql = `INSERT INTO cache(cache_key, cache_value, expires) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE cache_value = VALUES(cache_value), expires = VALUES(expires);`;

        return new Promise((resolve, reject) => {
            this.connPool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                    return;
                }

                conn.query(sql, [key, value, EX], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    async get(key: string): Promise<any> {
        const sql = `SELECT *, DATE_ADD(updated_at, INTERVAL expires SECOND) AS expired_at
        FROM cache
        WHERE cache_key = ? AND ((expires = -1) OR (DATE_ADD(updated_at, INTERVAL expires SECOND) >= CURRENT_TIME))
        LIMIT 1;`;

        return new Promise((resolve, reject) => {
            this.connPool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                conn.query(sql, [key], (err, rows: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (Array.isArray(rows) && rows.length >= 1) {
                        logger.debug(`Hit cache with key ${key}.`);
                        resolve(rows[0]?.cache_value);
                    } else {
                        resolve(null);
                    }
                });
            });
        });
    }

}