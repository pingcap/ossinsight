import {MySQLPromisePool} from "@fastify/mysql";
import fp from "fastify-plugin";

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

  constructor(readonly tidb: MySQLPromisePool) {
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