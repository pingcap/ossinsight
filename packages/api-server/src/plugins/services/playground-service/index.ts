import fp from "fastify-plugin";
import {MySQLPromisePool} from "@fastify/mysql";
import {QuestionContext} from "../bot-service";

declare module 'fastify' {
    interface FastifyInstance {
        playgroundService: PlaygroundService;
    }
}

export interface QuestionRecord {
    userId: number;
    context: QuestionContext | null;
    question: string;
    sql: string | null;
    success: boolean;
    preset: boolean;
}

export default fp(async (app) => {
    app.decorate('playgroundService', new PlaygroundService(app.mysql));
}, {
    name: 'playground-service',
    dependencies: [
        '@fastify/mysql'
    ]
});

export class PlaygroundService {

    constructor(
        private readonly mysql: MySQLPromisePool
    ) {
    }

    async recordQuestion(questionRecord: QuestionRecord):Promise<void> {
        const { userId, context, question, sql, success, preset } = questionRecord;
        let contextJSON = null;
        if (context) {
            contextJSON = JSON.stringify(context);
        }
        // Notice: sql is a reserved word in TiDB.
        await this.mysql.query(`
            INSERT INTO playground_question_records (user_id, context, question, \`sql\`, success, preset)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, contextJSON, question, sql, success, preset]);
    }

    async countTodayQuestionRequests(userId: number, preset: boolean):Promise<number> {
        const [result] = await this.mysql.query<any[]>(`
            SELECT COUNT(*) AS count
            FROM playground_question_records pqr
            WHERE
                user_id = ?
                AND preset = ?
                AND requested_at BETWEEN DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00') AND DATE_FORMAT(NOW(), '%Y-%m-%d 23:59:59');
        `, [userId, preset]);
        return result[0].count;
    }

}
