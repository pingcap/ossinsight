import { FastifyServer, GitHubRepoWithEvents } from '../../types';

import { DateTime } from 'luxon';
import {FastifyInstance} from 'fastify';
import {Job, WorkerOptions} from "bullmq";

export interface CalcMilestonesJobInput {
    from?: DateTime;
    to?: DateTime;
    pageSize?: number;
}

export default async (
    app: FastifyInstance,
    job: Job<CalcMilestonesJobInput, any, string>
) => {
    if (!job.data) {
        app.log.warn("No job data provided");
        return;
    }

    try {
        const {
            from = DateTime.now().minus({ hours: 1 }),
            to = DateTime.now(),
            pageSize = 20000
        } = job.data;

        await calcRepoMilestonesInConcurrent(app, from, to, pageSize);
    } catch (err) {
        app.log.error(err, 'Failed to calc-repo-milestones job.');
    }
}

export const workerConfig =  (
  app: FastifyInstance,
) => {
    return {
        autorun: true,
        concurrency: 1,
    } as WorkerOptions;
}

export async function calcRepoMilestonesInConcurrent (
    app: FastifyServer,
    from: DateTime,
    to: DateTime,
    pageSize: number,
) {
    let page = 1;
    let i = 0;
    while (true) {
        // Fetch events.
        const offset = (page - 1) * pageSize;
        app.log.info(
            `Fetching events for time range from ${from.toSQL()} to ${to.toSQL()}, page: ${page}.`,
        );
        const [events] = await app.mysql.query<GitHubRepoWithEvents[]>(`
            SELECT repo_id AS repoId, ANY_VALUE(repo_name) AS repoName, type, action, COUNT(1) AS events
            FROM github_events ge
            WHERE type IN ('PullRequestEvent', 'WatchEvent', 'IssuesEvent') AND created_at BETWEEN ? AND ?
            GROUP BY repo_id, type, action
            ORDER BY events DESC
            LIMIT ?, ?
        `, [from.toSQL(), to.toSQL(), offset, pageSize]);

        if (!Array.isArray(events) || events.length === 0) {
            break;
        } else {
            app.log.info(
                'Fetched events for time range from %s to %s, page: %d, found: %d.',
                from.toSQL(),
                to.toSQL(),
                page,
                events.length,
            );
        }

        // Push events to queue.
        for (const event of events) {
            event.index = i++;
            await app.queues.calc_milestones_for_repo_events.add('event', event);
        }

        page++;
    }
}

