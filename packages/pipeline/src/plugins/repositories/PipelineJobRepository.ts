import fp from "fastify-plugin";
import {DateTime} from "luxon";
import {ResultSetHeader} from "mysql2";
import {Pool} from 'mysql2/promise';
import {TimeRange} from "../../utils/time";
import {APIError} from '../../errors';

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
  const repository = new PipelineJobRepository(app.mysql);
  await repository.assertReady();
  app.decorate('pipelineJobRepository', repository);
}, {
  name: '@ossinsight/pipeline-job-repository',
  dependencies: [
    '@ossinsight/tidb'
  ]
});

export class PipelineJobRepository {

  constructor(private readonly tidb: Pick<Pool, 'execute' | 'getConnection'>) {
  }

  async assertReady() {
    try { await this.tidb.execute('SELECT pipeline_name FROM sys_pipeline_locks LIMIT 0'); }
    catch { throw new Error('Apply packages/pipeline/migrations/001_atomic_pipeline_jobs.sql before starting pipeline workers.'); }
  }

  async executeRange(pipelineName: string, tFrom: DateTime, tTo: DateTime, sql: string, skipCompleted = true): Promise<boolean> {
    const from = tFrom.toUTC().toSQL({includeOffset: false});
    const to = tTo.toUTC().toSQL({includeOffset: false});
    // Administrators can provision these rows so workers need only SELECT on the
    // lock table. The transaction below still acquires and verifies the row lock.
    const [existingLock] = await this.tidb.execute<any[]>(
      'SELECT pipeline_name FROM sys_pipeline_locks WHERE pipeline_name = ?', [pipelineName]);
    if (existingLock.length === 0) {
      await this.tidb.execute('INSERT IGNORE INTO sys_pipeline_locks (pipeline_name) VALUES (?)', [pipelineName]);
    }
    const connection = await this.tidb.getConnection();
    let originalMode: string | undefined;
    let started = false;
    let transactionActive = false;
    const start = Date.now();
    try {
      const [settings] = await connection.query<any[]>('SELECT @@SESSION.sql_mode AS mode');
      originalMode = settings[0].mode;
      // TiFlash materialization requires non-strict mode; configure this exact connection.
      await connection.query("SET SESSION sql_mode = 'ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");
      await connection.query('BEGIN /*T! PESSIMISTIC */');
      transactionActive = true;
      const [lock] = await connection.execute<any[]>('SELECT pipeline_name FROM sys_pipeline_locks WHERE pipeline_name = ? FOR UPDATE', [pipelineName]);
      if (lock.length !== 1) throw new Error('Pipeline lock unavailable.');
      if (skipCompleted) {
        const [previous] = await connection.execute<any[]>(`
          SELECT status FROM sys_pipelines_jobs
          WHERE pipeline_name = ? AND time_range_start = ? AND time_range_end = ?
            AND status IN (?, ?) FOR UPDATE
        `, [pipelineName, from, to, PipelineJobStatus.RUNNING, PipelineJobStatus.SUCCEED]);
        if (previous.some(row => row.status === PipelineJobStatus.SUCCEED)) {
          await connection.commit();
          transactionActive = false;
          return false;
        }
        if (previous.length) throw new APIError(409, 'A previous run needs reconciliation before this range can be retried.');
      }
      const [job] = await connection.execute<ResultSetHeader>(`
        INSERT INTO sys_pipelines_jobs (pipeline_name, time_range_start, time_range_end, status)
        VALUES (?, ?, ?, ?)
      `, [pipelineName, from, to, PipelineJobStatus.RUNNING]);
      started = true;
      await connection.execute(sql, {from, to});
      await connection.execute(`UPDATE sys_pipelines_jobs SET status = ?, ended_at = NOW(), message = ?, duration = ? WHERE job_id = ?`,
        [PipelineJobStatus.SUCCEED, 'Query OK!', (Date.now() - start) / 1000, job.insertId]);
      // Data and completion become visible together; a crash cannot leave committed data
      // with an uncommitted completion marker that would invite duplicate backfills.
      await connection.commit();
      transactionActive = false;
      return true;
    } catch (error) {
      try { await connection.rollback(); transactionActive = false; } catch {}
      if (started && !transactionActive) {
        try {
          // Reuse the released transaction's connection: asking the pool for another
          // connection here could deadlock when every worker is handling a failure.
          await connection.execute(`INSERT INTO sys_pipelines_jobs
            (pipeline_name, time_range_start, time_range_end, status, ended_at, message, duration)
            VALUES (?, ?, ?, ?, NOW(), ?, ?)`, [pipelineName, from, to, PipelineJobStatus.FAILED,
            'Execution failed; check committed state before retrying.', (Date.now() - start) / 1000]);
        } catch {}
      }
      throw error;
    } finally {
      try {
        if (originalMode === undefined || transactionActive) throw new Error('Connection state unknown.');
        await connection.query('SET SESSION sql_mode = ?', [originalMode]);
        connection.release();
      } catch { connection.destroy(); }
    }
  }

  async getProcessedTimeRanges(pipelineName: string, from: DateTime, to: DateTime): Promise<TimeRange[]> {
    const [processed] = await this.tidb.execute<any[]>(`
      SELECT time_range_start, time_range_end
      FROM sys_pipelines_jobs spj
      WHERE
        status = ?
        AND pipeline_name = ?
        AND time_range_start >= ?
        AND time_range_end <= ?
      ORDER BY time_range_start
    `, [PipelineJobStatus.SUCCEED, pipelineName, from.toUTC().toSQL({includeOffset: false}), to.toUTC().toSQL({includeOffset: false})]);
    return processed.map((row) => {
      return {
        tFrom: databaseTime(row.time_range_start),
        tTo: databaseTime(row.time_range_end),
      };
    });
  }

}

function databaseTime(value: Date | string): DateTime {
  return value instanceof Date ? DateTime.fromJSDate(value, {zone: 'utc'}) : DateTime.fromSQL(value, {zone: 'utc'});
}
