import {FastifyInstance} from "fastify";
import {Job, WorkerOptions} from "bullmq";
import {PoolConnection, ResultSetHeader} from "mysql2/promise";
import {
    EventType,
    MilestoneType,
    PULL_REQUEST_CREATORS_HAD_STEPS,
    PULL_REQUESTS_MERGED_STEPS,
    ISSUES_RECEIVED_STEPS,
    STARS_EARNED_STEPS
} from "../../types";

export interface GitHubRepoEventsInput {
    type: EventType;
    action: string;
    repoId: number;
    repoName: number;
}

export default async (
    app: FastifyInstance,
    job: Job<GitHubRepoEventsInput>
) => {
    if (!job.data) {
        app.log.warn("No job data provided");
        return;
    }

    const { repoId, repoName, type, action } = job.data;
    const conn = await app.mysql.getConnection();

    try {
        await Promise.all([
            checkIssueReceivedMilestones(conn, type, action, repoId),
            checkStarsEarnedMilestones(conn, type, action, repoId),
            checkPullRequestMergedMilestones(conn, type, action, repoId),
            checkPullRequestCreatorsMilestones(conn, type, action, repoId),
        ]);
    } catch (err) {
        app.log.error(err, 'Failed to handle the event happened in %s.', repoName);
    } finally {
        await conn.release();
    }
}

export const workerConfig =  (
  app: FastifyInstance,
) => {
    return {
        autorun: true,
        concurrency: 10,
    } as WorkerOptions;
}

async function checkIssueReceivedMilestones (
    conn: PoolConnection,
    type: EventType,
    action: string,
    repoId: number,
): Promise<number> {
    if (type !== 'IssuesEvent' || action !== 'opened') {
        return 0;
    }
    const [rs] = await conn.query<ResultSetHeader>(
        `
        INSERT INTO sys_repo_milestones(repo_id, milestone_type_id, milestone_number, payload, reached_at)
        SELECT repo_id, ? AS milestone_type_id, row_num AS milestone_number, NULL, created_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num, created_at
            FROM github_events ge
            WHERE
                type = 'IssuesEvent'
                AND repo_id = ?
                AND action = 'opened'
        ) AS sub
        WHERE row_num IN ?
        ON DUPLICATE KEY UPDATE reached_at = created_at;
    `,
        [MilestoneType.ISSUES_RECEIVED, repoId, [ISSUES_RECEIVED_STEPS]],
    );
    return rs.affectedRows;
}

async function checkStarsEarnedMilestones (
    conn: PoolConnection,
    type: EventType,
    action: string,
    repoId: number,
): Promise<number> {
    if (type !== 'WatchEvent' || action !== 'started') {
        return 0;
    }
    const [rs] = await conn.query<ResultSetHeader>(
        `
        INSERT INTO sys_repo_milestones(repo_id, milestone_type_id, milestone_number, payload, reached_at)
        SELECT repo_id, ? AS milestone_type_id, row_num AS milestone_number, NULL, created_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num, created_at
            FROM github_events ge
            WHERE
                type = 'WatchEvent'
                AND repo_id = ?
        ) AS sub
        WHERE row_num IN ?
        ON DUPLICATE KEY UPDATE reached_at = created_at;
    `,
        [MilestoneType.STARS_EARNED, repoId, [STARS_EARNED_STEPS]],
    );
    return rs.affectedRows;
}

async function checkPullRequestMergedMilestones (
    conn: PoolConnection,
    type: EventType,
    action: string,
    repoId: number,
): Promise<number> {
    if (type !== 'PullRequestEvent' || action !== 'closed') {
        return 0;
    }
    const [rs] = await conn.query<ResultSetHeader>(
        `
        INSERT INTO sys_repo_milestones(repo_id, milestone_type_id, milestone_number, payload, reached_at)
        SELECT repo_id, ? AS milestone_type_id, row_num AS milestone_number, NULL, created_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num, created_at
            FROM github_events ge
            WHERE
                type = 'PullRequestEvent'
                AND repo_id = ?
                AND action = 'closed'
                AND pr_merged = true
        ) AS sub
        WHERE row_num IN ?
        ON DUPLICATE KEY UPDATE reached_at = created_at;
    `,
        [MilestoneType.PULL_REQUEST_MERGED, repoId, [PULL_REQUESTS_MERGED_STEPS]],
    );
    return rs.affectedRows;
}

async function checkPullRequestCreatorsMilestones (
    conn: PoolConnection,
    type: EventType,
    action: string,
    repoId: number,
): Promise<number> {
    if (type !== 'PullRequestEvent' || action !== 'opened') {
        return 0;
    }
    const [rs] = await conn.query<ResultSetHeader>(
        `
        INSERT INTO sys_repo_milestones(repo_id, milestone_type_id, milestone_number, payload, reached_at)
        SELECT repo_id, ? AS milestone_type_id, row_num AS milestone_number, NULL, first_pr_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY first_pr_at) AS row_num, first_pr_at
            FROM (
                SELECT
                    repo_id,
                    actor_login,
                    MIN(created_at) AS first_pr_at
                FROM github_events ge
                WHERE
                    type = 'PullRequestEvent'
                    AND repo_id = ?
                    AND action = 'opened'
                GROUP BY repo_id, actor_login
            ) sub
        ) AS sub
        WHERE row_num IN ?
        ON DUPLICATE KEY UPDATE reached_at = first_pr_at;
    `,
        [
            MilestoneType.PULL_REQUEST_CREATORS_HAD,
            repoId,
            [PULL_REQUEST_CREATORS_HAD_STEPS],
        ],
    );
    return rs.affectedRows;
}
