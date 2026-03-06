import { DateTime } from "luxon";
import {TiDBPlaygroundQueryExecutor} from "../../executor/query-executor/TiDBPlaygroundQueryExecutor";

export class SQLRunner {

    constructor(private readonly executor: TiDBPlaygroundQueryExecutor) {}
  
    async run(sql: string) {
        try {
            const start = DateTime.now();
            const [data, fields] = await this.executor.execute('playground-sql', sql);
            const end = DateTime.now();

            return {
                requestedAt: start,
                finishedAt: end,
                spent: end.diff(start).as("seconds"),
                sql: sql,
                fields,
                data,
            };
        } catch (e) {
            if (e) {
                (e as any).sql = sql;
            }
            throw e;
        }
    }

}
  