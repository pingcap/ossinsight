import {
    User,
} from '../../types';
import { FastifyInstance } from 'fastify';
import { MySQLPromisePool } from '@fastify/mysql';
import {Job} from "bullmq";

export default async (
    app: FastifyInstance,
    job: Job<{}, any, string>
) => {
    if (!job.data) {
        app.log.warn("No job data provided");
        return;
    }

    const pageSize = 200;
    try {
        let pageNum = 1;
        while (true) {
            const subscribers = await getSubscribers(app.mysql, pageNum, pageSize);
            if (!Array.isArray(subscribers) || subscribers.length === 0) {
                break;
            }

            for (const subscriber of subscribers) {
                await app.queues.send_feeds_email.add('send_feeds_email', subscriber);
            }

            if (subscribers.length < pageSize) {
                break;
            }

            pageNum++;
        }
    } catch (err) {
        app.log.error(err, 'Failed to execute %s job.', 'send_feeds_emails');
    }
};


async function getSubscribers (
    dbPool: MySQLPromisePool,
    page: number = 1,
    pageSize: number = 10,
): Promise<User[]> {
    const offset = (page - 1) * pageSize;
    const [rows] = await dbPool.query<User[]>(
        `
        SELECT id, github_id AS githubId, github_login AS githubLogin, email_address AS emailAddress
        FROM sys_users su
        JOIN sys_watched_repos swr ON su.id = swr.user_id
        WHERE
            su.email_address IS NOT NULL
            AND su.email_get_updates = 1
        OFFSET ? LIMIT ?;
    `,
        [offset, pageSize],
    );
    return rows;
}
