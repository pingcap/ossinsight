import consola from "consola";
import { TiDBQueryExecutor } from "../TiDBQueryExecutor";
import { CacheOption, CacheProvider } from "./CacheProvider";

const logger = consola.withTag('normal-table-cache')

export default class NormalTableCacheProvider implements CacheProvider {

    constructor(
        private readonly tidbClient: TiDBQueryExecutor
    ) {

    }
    
    async set(key: string, value: string, options?: CacheOption): Promise<void> {
        const EX = options?.EX || -1;
        const sql = `INSERT INTO cache(cache_key, cache_value, expires) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE cache_value = VALUES(cache_value), expires = VALUES(expires);`;
      
        await this.tidbClient.prepare(sql, [key, value, EX]);
    }

    async get(key: string): Promise<any> {
        const sql = `SELECT *, DATE_ADD(updated_at, INTERVAL expires SECOND) AS expired_at
        FROM cache
        WHERE cache_key = ? AND ((expires = -1) OR (DATE_ADD(updated_at, INTERVAL expires SECOND) >= CURRENT_TIME))
        LIMIT 1;`;
        
        const result = await this.tidbClient.prepare(sql, [key]);
        const rows = result.rows as any[];
        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        } else {
            return rows[0]?.cache_value;
        }
    }

}