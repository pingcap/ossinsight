import consola from "consola";
import { OkPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import { ConnectionWrapper } from "../../utils/db";
import { CacheOption, CacheProvider } from "./CacheProvider";

const logger = consola.withTag('normal-table-cache')

export default class NormalTableCacheProvider implements CacheProvider {

    constructor(
        private readonly conn: ConnectionWrapper
    ) {}

    async set<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        key: string, value: string, options?: CacheOption
    ) {
        const EX = options?.EX || -1;
        const sql = `INSERT INTO cache(cache_key, cache_value, expires) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE cache_value = VALUES(cache_value), expires = VALUES(expires);`;

        return this.conn.query<T>(sql, [key, value, EX]);
    }

    async get(key: string): Promise<any> {
        const sql = `SELECT *, DATE_ADD(updated_at, INTERVAL expires SECOND) AS expired_at
        FROM cache
        WHERE cache_key = ? AND ((expires = -1) OR (DATE_ADD(updated_at, INTERVAL expires SECOND) >= NOW()))
        LIMIT 1;`;

        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.conn.query(sql, [key]);
                const rows: any = res?.result;
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