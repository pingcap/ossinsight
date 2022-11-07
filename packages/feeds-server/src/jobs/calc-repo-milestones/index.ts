import { EventType, FastifyServer, GitHubRepoWithEvents, ISSUES_RECEIVED_STEPS, IssuesEventTypeAction, MilestoneType, PULL_REQUESTS_MERGED_STEPS, PULL_REQUEST_CREATORS_HAD_STEPS, PullRequestEventTypeAction, STARS_EARNED_STEPS } from '../../types';

import { DateTime } from 'luxon';
import { PrismaClient } from '@prisma/client';
import async from 'async';
import fp from 'fastify-plugin';
import { join } from '@prisma/client/runtime';

export default fp(async (fastify) => {
    fastify.cron.createJob({
        name: 'calc-repo-milestones',
        cronTime: fastify.config.CALC_REPO_MILESTONES_CRON,
        onTick: async (server) => {
            try {
                const from = DateTime.now().minus({ hours: 1 });
                const to = DateTime.now();
                const concurrent = server.config.CALC_REPO_MILESTONES_CONCURRENT;
                await calcRepoMilestonesInConcurrent(server, concurrent, from, to);
            } catch(err) {
                server.log.error(err, 'Failed to send watched repo milestones feeds.');
            }
        }
    });
})

export async function calcRepoMilestonesInConcurrent(server: FastifyServer, concurrent: number, from: DateTime, to: DateTime) {
    const queue = async.queue<GitHubRepoWithEvents>(async (event) => {
        const { index, repoId, repoName, type, action } = event;
        server.log.info(`[${index}] Handle repo <${repoName}> with id ${repoId}.`);

        // Milestone: the number of issues received.
        if (type === EventType.ISSUES_EVENT && action === IssuesEventTypeAction.OPENED) {
            await checkIssueReceivedMilestones(server.prisma, repoId)
        }

        // Milestone: the number of stars earned.
        if (type === EventType.WATCH_EVENT) {
            await checkStarsEarnedMilestones(server.prisma, repoId);
        }

        // Milestone: the number of merged pull request.
        if (type === EventType.PULL_REQUEST_EVENT && action === PullRequestEventTypeAction.CLOSED) {
            await checkPullRequestMergedMilestones(server.prisma, repoId);
        }

        // Milestone: the number of pull request creators.
        if (type === EventType.PULL_REQUEST_EVENT && action === PullRequestEventTypeAction.OPENED) {
            await checkPullRequestCreatorsMilestones(server.prisma, repoId);
        }
    }, concurrent);

    let page = 1, pageSize = 20000, i = 0;
    while (true) {
        const offset = (page - 1) * pageSize;
        server.log.info(`Fetching events for time range from ${from.toSQL()} to ${to.toSQL()}, page: ${page}.`);
        const [events] = await server.prisma.$queryRaw<GitHubRepoWithEvents[]>`
            SELECT repo_id AS repoId, ANY_VALUE(repo_name) AS repoName, type, action, COUNT(1) AS events
            FROM github_events ge
            WHERE type IN ('PullRequestEvent', 'WatchEvent', 'IssuesEvent') AND created_at BETWEEN ${from.toSQL()} AND ${to.toSQL()}
            GROUP BY repo_id, type, action
            ORDER BY events DESC
            LIMIT ${offset}, ${pageSize}
        `;

        if (!Array.isArray(events) || events.length === 0) {
            break;
        } else {
            server.log.info(`Fetched ${events.length} events for time range from ${from.toSQL()} to ${to.toSQL()}, page: ${page}.`);
        }

        for (const event of events) {
            event.index = i++;
            queue.push(event);
        }

        if (queue.started) {
            await queue.drain();
        }
    }
}

async function checkIssueReceivedMilestones(prisma: PrismaClient, repoId: number):Promise<number> {
    return await prisma.$queryRaw`
        INSERT INTO repo_milestones(repo_id, milestone_type_id, milestone_number, payload, reached_at)
        SELECT repo_id, ${MilestoneType.ISSUES_RECEIVED} AS milestone_type_id, row_num AS milestone_number, NULL, created_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num, created_at
            FROM github_events ge
            WHERE
                type = 'IssuesEvent'
                AND repo_id = ${repoId}
                AND action = 'opened'
        ) AS sub
        WHERE row_num IN (${join(ISSUES_RECEIVED_STEPS)})
        ON DUPLICATE KEY UPDATE reached_at = created_at;
    `;
}

async function checkStarsEarnedMilestones(prisma: PrismaClient, repoId: number):Promise<number> {
    return await prisma.$queryRaw`
        INSERT INTO repo_milestones(repo_id, milestone_type_id, milestone_number, payload, reached_at)
        SELECT repo_id, ${MilestoneType.STARS_EARNED} AS milestone_type_id, row_num AS milestone_number, NULL, created_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num, created_at
            FROM github_events ge
            WHERE
                type = 'WatchEvent'
                AND repo_id = ${repoId}
        ) AS sub
        WHERE row_num IN (${join(STARS_EARNED_STEPS)})
        ON DUPLICATE KEY UPDATE reached_at = created_at;
    `;
}

async function checkPullRequestMergedMilestones(prisma: PrismaClient, repoId: number):Promise<number> {
    return await prisma.$queryRaw`
        INSERT INTO repo_milestones(repo_id, milestone_type_id, milestone_number, payload, reached_at)
        SELECT repo_id, ${MilestoneType.PULL_REQUEST_MERGED} AS milestone_type_id, row_num AS milestone_number, NULL, created_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num, created_at
            FROM github_events ge
            WHERE
                type = 'PullRequestEvent'
                AND repo_id = ${repoId}
                AND action = 'closed'
                AND pr_merged = true
        ) AS sub
        WHERE row_num IN (${join(PULL_REQUESTS_MERGED_STEPS)})
        ON DUPLICATE KEY UPDATE reached_at = created_at;
    `;
}

async function checkPullRequestCreatorsMilestones(prisma: PrismaClient, repoId: number):Promise<number> {
    return await prisma.$queryRaw`
        INSERT INTO repo_milestones(repo_id, milestone_type_id, milestone_number, payload, reached_at)
        SELECT repo_id, ${MilestoneType.PULL_REQUEST_CREATORS_HAD} AS milestone_type_id, row_num AS milestone_number, NULL, first_pr_at
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
                    AND repo_id = ${repoId}
                    AND action = 'opened'
                GROUP BY repo_id, actor_login
            ) sub
        ) AS sub
        WHERE row_num IN (${join(PULL_REQUEST_CREATORS_HAD_STEPS)})
        ON DUPLICATE KEY UPDATE reached_at = first_pr_at;
    `;
}