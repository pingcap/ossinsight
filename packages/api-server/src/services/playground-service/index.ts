import fp from "fastify-plugin";
import {MySQLPromisePool} from "@fastify/mysql";
import {APIError} from "../../utils/error";
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
    app.decorate('playgroundService', new PlaygroundService(app.mysql, {
        dailyQuestionLimit: app.config.PLAYGROUND_DAILY_QUESTIONS_LIMIT,
    }));
}, {
    name: 'playground-service',
    dependencies: [
        '@fastify/mysql'
    ]
});

export interface PlaygroundOption {
  dailyQuestionLimit?: number;
}

export class PlaygroundService {

    private readonly dailyQuestionLimit: number | undefined;

    constructor(
        private readonly mysql: MySQLPromisePool,
        options?: PlaygroundOption
    ) {
        this.dailyQuestionLimit = options?.dailyQuestionLimit;
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

    // Check if the user has reached the daily question limit.
    async checkIfUserHasReachedDailyQuestionLimit(userId: number) {
        const count = await this.countTodayQuestionRequests(userId, false);
        if (this.dailyQuestionLimit !== undefined && count >= this.dailyQuestionLimit) {
            throw new APIError(429, `You have reached the daily question limit (${count}/${this.dailyQuestionLimit})`);
        }
    }
}
