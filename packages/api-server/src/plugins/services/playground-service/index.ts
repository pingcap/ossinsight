import {Pool} from "mysql2/promise";
import fp from "fastify-plugin";
import {ResultSetHeader} from 'mysql2';
import {withTransaction} from '../../../utils/db';
import {APIError} from '../../../utils/error';

declare module 'fastify' {
  interface FastifyInstance {
    playgroundService: PlaygroundService;
  }
}

export default fp(async (app) => {
  app.decorate('playgroundService', new PlaygroundService(app.mysql));
}, {
  name: '@ossinsight/playground-service',
  dependencies: [
    '@fastify/env',
    '@ossinsight/tidb',
    '@ossinsight/redis',
  ]
});

export interface QuestionRecord {
  userId: number;
  context: Record<string, any> | null;
  question: string;
  sql: string | null;
  success: boolean;
  preset: boolean;
}

export class PlaygroundService {

  constructor(readonly tidb: Pick<Pool, 'query' | 'getConnection'>) {
  }

  normalizeQuestion(question: string): string {
    return question.replaceAll(/\s+/g, ' ');
  }

  async getExistedQuestion(question: string): Promise<QuestionRecord[]> {
    question = this.normalizeQuestion(question);
    // Notice: sql is a reserved word in TiDB.
    const [records] = await this.tidb.query<any[]>(`
            SELECT id, user_id AS userId, context, question, \`sql\`, success, preset, requested_at AS requestedAt
            FROM playground_question_records pqr
            WHERE success = true AND question = ?
        `, [question]);
    return records;
  }

  async recordQuestion(questionRecord: Record<string, any>): Promise<void> {
    const {userId, context, question, sql, success, preset} = questionRecord;
    let contextJSON = null;
    if (context) {
      contextJSON = JSON.stringify(context);
    }
    // Notice: sql is a reserved word in TiDB.
    await this.tidb.query(`
      INSERT INTO playground_question_records (user_id, context, question, \`sql\`, success, preset)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, contextJSON, question, sql, success, preset]);
  }

  async reserveQuestion(userId: number, context: Record<string, any>, question: string, limit: number): Promise<{id: number; used: number}> {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 10000) throw new APIError(500, 'Invalid quota configuration.');
    const reservation = await withTransaction(this.tidb, async conn => {
      // Lock a stable existing row even when the user has no request records.
      const [users] = await conn.query<any[]>('SELECT id FROM sys_users WHERE id = ? FOR UPDATE', [userId]);
      if (users.length !== 1) throw new APIError(401, 'User account unavailable.');
      // Use a current locking read: a transaction snapshot may predate our wait
      // for the per-user lock and omit a concurrent committed reservation.
      const [records] = await conn.query<any[]>(`
        SELECT id FROM playground_question_records
        WHERE user_id = ? AND preset = false AND requested_at >= CURRENT_DATE
          AND requested_at < CURRENT_DATE + INTERVAL 1 DAY
        LIMIT ? FOR UPDATE
      `, [userId, limit]);
      if (records.length >= limit) throw new APIError(429, 'You have reached the daily question limit. Please try again tomorrow.');
      const [result] = await conn.query<ResultSetHeader>(`
        INSERT INTO playground_question_records (user_id, context, question, \`sql\`, success, preset)
        VALUES (?, ?, ?, NULL, false, false)
      `, [userId, JSON.stringify(context), question]);
      return {id: result.insertId, used: records.length + 1};
    });
    if (!reservation) throw new APIError(500, 'Failed to reserve question quota.');
    return reservation;
  }

  async finishQuestion(id: number, userId: number, sql: string | null, success: boolean): Promise<void> {
    await this.tidb.query('UPDATE playground_question_records SET `sql` = ?, success = ? WHERE id = ? AND user_id = ?', [sql, success, id, userId]);
  }

  async countTodayQuestionRequests(userId: number, preset: boolean): Promise<number> {
    const [result] = await this.tidb.query<any[]>(`
      SELECT COUNT(*) AS count
      FROM playground_question_records pqr
      WHERE
        user_id = ?
        AND preset = ?
        AND requested_at BETWEEN DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(NOW(), '%Y-%m-%d 23:59:59');
    `, [userId, preset]);
    return result[0].count;
  }

  // Trusted users.
  // TODO: save the trusted users in playground_trusted_users table.

  async checkIfTrustedUser(userId: number): Promise<boolean> {
    const [rows] = await this.tidb.query<any[]>(`
        SELECT user_id AS userId FROM explorer_trusted_users
        WHERE user_id = ?
    `, [userId]);
    return rows.length > 0;
  }

}