import {MySQLPromisePool} from "@fastify/mysql";
import fp from "fastify-plugin";
import {DateTime} from "luxon";
import {ResultSetHeader} from "mysql2";
import {TimeRange} from "../../utils/time";

declare module 'fastify' {
  interface FastifyInstance {
    pipelineJobRepository: PipelineJobRepository;
  }
}

export enum PipelineJobStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  SUCCEED = 'SUCCEED',
  FAILED = 'FAILED',
}

export default fp(async (app) => {
  app.decorate('pipelineJobRepository', new PipelineJobRepository(app.mysql));
}, {
  name: '@ossinsight/pipeline-job-repository',
  dependencies: [
    '@ossinsight/tidb'
  ]
});

export class PipelineJobRepository {

  constructor(private readonly tidb: MySQLPromisePool) {
  }

  async getProcessedTimeRanges(pipelineName: string, from: DateTime, to: DateTime): Promise<TimeRange[]> {
    const [processed] = await this.tidb.execute<any[]>(`
      SELECT time_range_start, time_range_end
      FROM sys_pipelines_jobs spj
      WHERE
        status IN (?, ?)
        AND pipeline_name = ?
        AND time_range_start >= ?
        AND time_range_end <= ?
      ORDER BY time_range_start
    `, [PipelineJobStatus.RUNNING, PipelineJobStatus.SUCCEED, pipelineName, from.toSQL(), to.toSQL()]);
    return processed.map((row) => {
      return {
        tFrom: row.time_range_start,
        tTo: row.time_range_end,
      };
    });
  }

  async createProcessedTimeRange(pipelineName: string, tFrom: DateTime, tTo: DateTime, status: PipelineJobStatus) {
    const [rs] = await this.tidb.execute<ResultSetHeader>(`
      INSERT INTO sys_pipelines_jobs (pipeline_name, time_range_start, time_range_end, status)
      VALUES (?, ?, ?, ?)
    `, [pipelineName, tFrom.toSQL(), tTo.toSQL(), status]);
    return rs.insertId;
  }

  async finishProcessedTimeRange(jobId: number, status: PipelineJobStatus.SUCCEED | PipelineJobStatus.FAILED, message: string, duration: number) {
    await this.tidb.execute(`
      UPDATE sys_pipelines_jobs SET status = ?, ended_at = NOW(), message = ?, duration = ? WHERE job_id = ?
    `, [status, message, duration.toString(), jobId]);
  }

}