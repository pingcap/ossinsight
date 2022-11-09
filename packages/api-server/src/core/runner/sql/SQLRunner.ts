import { DateTime } from "luxon";
import { QueryExecutor } from "../../executor/query-executor/QueryExecutor";

export class SQLRunner {

    constructor(
        public readonly executor: QueryExecutor
    ) {}
  
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
  