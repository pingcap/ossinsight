import { RowDataPacket } from "mysql2/promise";
import {TiDBQueryExecutor} from "../core/TiDBQueryExecutor";

export interface MaxEventTime extends RowDataPacket {
  last: string;
}

export default class GHEventService {

  constructor(readonly executor: TiDBQueryExecutor) {
  }

  async getMaxEventTime():Promise<string> {
    const [rows] = await this.executor.execute<MaxEventTime[]>('get-max-event-time', `
      SELECT DATE_FORMAT(MAX(created_at), '%Y-%m-%d %H:%i:%S') AS last
      FROM github_events
      USE INDEX(index_github_events_on_created_at)
      WHERE created_at > DATE_SUB(now(), INTERVAL 1 DAY);
    `);
    return rows[0]?.last;
  }

}
