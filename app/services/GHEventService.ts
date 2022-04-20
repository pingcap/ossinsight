import {MysqlQueryExecutor} from "../core/MysqlQueryExecutor";

export default class GHEventService {

  constructor(readonly executor: MysqlQueryExecutor<unknown>) {
  }

  async getMaxEventTime():Promise<string> {
    const values = await this.executor.execute(
      `SELECT DATE_FORMAT(MAX(created_at), '%Y-%m-%d %H:%i:%S') AS last FROM github_events WHERE type = 'WatchEvent'`
    ) as { last: string }[];
    return values[0]?.last;
  }

}
