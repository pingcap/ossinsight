import {FastifyInstance} from "fastify";
import {Job} from "bullmq";
import {FastifyServer, User} from "../../types";
import {PoolConnection, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import {DateTime} from "luxon";
import {EmailTemplateNames} from "@ossinsight/email-server";

export default async (
    app: FastifyInstance,
    job: Job<User, any, string>
) => {
    if (!job.data) {
        app.log.warn("No job data provided");
        return;
    }

    try {
        await sendRepoFeedsToSubscriber(app, job.data);
    } catch (err) {
        app.log.error(err, 'Failed to execute %s job.', 'send_milestone_emails');
    }
};

export interface RepoMilestoneToSent {
    repoId: number;
    subscribedUserId: number;
    milestoneId: number;
}

async function sendRepoFeedsToSubscriber (server: FastifyServer, subscriber: User) {
    const { id: watcherId, emailAddress, githubLogin } = subscriber;
    let conn: PoolConnection | null = null;
    try {
        conn = await server.mysql.getConnection();
        await conn.beginTransaction();
        const repoMilestones = await getRepoMilestonesForUser(conn, watcherId);
        // Skip if there is no new repo milestones.
        if (repoMilestones.length > 0) {
            const subject = `What happened on my watched repositories on ${DateTime.utc().toLocaleString(
                DateTime.DATE_FULL,
            )}?`;

            await server.emailClient.sendEmail({
                to: emailAddress,
                subject,
                templateName: EmailTemplateNames.REPO_FEEDS,
                templateData: {
                    githubLogin,
                    repoMilestones,
                }
            });
            await markRepoMilestonesAsSent(conn, repoMilestones);
        }
        await conn.commit();
    } catch (err) {
        server.log.error(
            err,
            `Failed to send repository feeds to watcher ${watcherId}.`,
        );
        if (conn) {
            await conn.rollback();
            await conn.end();
        }
    }
}

async function getRepoMilestonesForUser (
    conn: PoolConnection,
    userId: number,
    page: number = 1,
    pageSize: number = 10,
): Promise<RepoMilestoneToSent[]> {
    const offset = (page - 1) * pageSize;
    const [rows] = await conn.query<RowDataPacket[]>(`
        WITH repo_milestone_will_be_sent AS (
            SELECT
                srm.id AS milestone_id,
                srm.repo_id,
                srm.milestone_type_id,
                srm.milestone_number,
                srm.payload,
                srm.created_at AS reached_at,
                swr.user_id AS watcher_user_id
            FROM sys_repo_milestones srm
            JOIN sys_watched_repos swr ON srm.repo_id = swr.repo_id
            LEFT JOIN sys_sent_repo_milestones ssm ON ssm.repo_milestone_id = srm.id
            WHERE
                swr.user_id = ?
                AND ssm.user_id IS NULL     -- Exclude the sent milestones.
            ORDER BY srm.created_at DESC
            LIMIT ?, ?
        )
        SELECT
            rm.repo_id AS repoId,
            gr.repo_name AS repoName,
            m.milestone_id AS milestoneId,
            m.milestone_type_id AS milestoneTypeId,
            mt.name AS milestone_type_name AS milestoneTypeName,
            m.milestone_number AS milestoneNumber,
            m.payload AS milestonePayload,
            m.reached_at AS milestoneReachedAt,
            m.watcher_user_id AS watcherUserId
        FROM repo_milestone_will_be_sent m
        JOIN github_repos gr ON m.repo_id = gr.repo_id
        JOIN sys_repo_milestone_types mt ON m.milestone_type_id = mt.id;
    `,[userId, offset, pageSize]);
    return rows as RepoMilestoneToSent[];
}

async function markRepoMilestonesAsSent (
    conn: PoolConnection,
    repoMilestones: RepoMilestoneToSent[],
) {
    const [rs] = await conn.query<ResultSetHeader>(`
        INSERT INTO sys_sent_repo_milestones (user_id, repo_milestone_id)
        VALUES ?
        ON DUPLICATE KEY UPDATE user_id = user_id;
    `, repoMilestones.map((m) => [m.subscribedUserId, m.milestoneId]));
    return rs.affectedRows;
}
