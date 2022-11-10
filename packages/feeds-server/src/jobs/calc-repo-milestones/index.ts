import {
  EventType,
  FastifyServer,
  GitHubRepoWithEvents,
  ISSUES_RECEIVED_STEPS,
  IssuesEventTypeAction,
  MilestoneType,
  PULL_REQUESTS_MERGED_STEPS,
  PULL_REQUEST_CREATORS_HAD_STEPS,
  PullRequestEventTypeAction,
  STARS_EARNED_STEPS,
} from '../../types';
import { PoolConnection, ResultSetHeader } from 'mysql2/promise';

import { Params as CronJobDef } from 'fastify-cron';
import { DateTime } from 'luxon';
import { FastifyInstance } from 'fastify';
import { JobName } from './../../types/index';
import async from 'async';
import fp from 'fastify-plugin';

export const CALC_REPO_MILESTONES_JOB_NAME: JobName = 'calc-repo-milestones';

export default fp(async (app: FastifyInstance) => {
  app.cron.createJob({
    name: CALC_REPO_MILESTONES_JOB_NAME,
    cronTime: app.config.CALC_REPO_MILESTONES_CRON,
    onTick: async function (server) {
      await calcRepoMilestoneJobHandler.bind(this)(this.name!, server);
    },
    startWhenReady: true,
  });
});

export async function calcRepoMilestoneJobHandler (
  this: CronJobDef,
  jobName: JobName,
  server: FastifyServer,
) {
  if (!jobName) {
    server.log.error('Skip execution, must provide jobName for the handler.');
    return;
  }

  try {
    // Init parameters.
    const parameters = server.jobParameters.get(jobName);
    let from = DateTime.now().minus({ hours: 1 });
    if (parameters?.from) {
      from = DateTime.fromSQL(parameters.from);
    }
    const to = DateTime.now();
    if (parameters?.to) {
      from = DateTime.fromSQL(parameters.to);
    }
    const concurrent = server.config.MAX_CONCURRENT;
    const pageSize = 20000;
    const jobParameters = Object.assign({}, parameters, {
      from,
      to,
      concurrent,
      pageSize,
    });
    server.jobParameters.set(jobName, jobParameters);

    // Init statuses.
    server.jobStatuses.set(jobName, {
      page: 0,
      processEvents: 0,
    });

    server.log.info(jobParameters, 'Starting execute job %s.', jobName);

    await calcRepoMilestonesInConcurrent(
      server,
      jobName,
      concurrent,
      from,
      to,
      pageSize,
    );
  } catch (err) {
    server.log.error(err, 'Failed to execute %s job.', jobName);
  }
}

export async function calcRepoMilestonesInConcurrent (
  app: FastifyServer,
  jobName: JobName,
  concurrent: number = 5,
  from: DateTime,
  to: DateTime,
  pageSize: number,
) {
  const queue = async.queue<GitHubRepoWithEvents>(async (event) => {
    const { repoId, repoName, type, action } = event;
    // app.log.info(`[${index}] Handle repo <${repoName}> with id ${repoId}.`);
    let conn: PoolConnection | null = null;

    try {
      conn = await app.mysql.getConnection();

      // Milestone: the number of issues received.
      if (
        type === EventType.ISSUES_EVENT &&
        action === IssuesEventTypeAction.OPENED
      ) {
        await checkIssueReceivedMilestones(conn, repoId);
      }

      // Milestone: the number of stars earned.
      if (type === EventType.WATCH_EVENT) {
        await checkStarsEarnedMilestones(conn, repoId);
      }

      // Milestone: the number of merged pull request.
      if (
        type === EventType.PULL_REQUEST_EVENT &&
        action === PullRequestEventTypeAction.CLOSED
      ) {
        await checkPullRequestMergedMilestones(conn, repoId);
      }

      // Milestone: the number of pull request creators.
      if (
        type === EventType.PULL_REQUEST_EVENT &&
        action === PullRequestEventTypeAction.OPENED
      ) {
        await checkPullRequestCreatorsMilestones(conn, repoId);
      }

      // Update job status.
      const oldStatus = app.jobStatuses.get(jobName) ?? {};
      app.jobStatuses.set(
        jobName,
        Object.assign(oldStatus, {
          processEvents: oldStatus.processEvents + 1,
        }),
      );
    } catch (err) {
      app.log.error(
        err,
        'Failed to calc repo milestones for repo <%s> with id <%s>.',
        repoName,
        repoId,
      );
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }, concurrent);

  let page = 1;
  let i = 0;
  while (true) {
    // Update job status.
    const oldStatus = app.jobStatuses.get(jobName) ?? {};
    app.jobStatuses.set(
      jobName,
      Object.assign(oldStatus, {
        page,
      }),
    );

    // Fetch events.
    const offset = (page - 1) * pageSize;
    app.log.info(
      `Fetching events for time range from ${from.toSQL()} to ${to.toSQL()}, page: ${page}.`,
    );
    const [events] = await app.mysql.query<GitHubRepoWithEvents[]>(
      `
            SELECT repo_id AS repoId, ANY_VALUE(repo_name) AS repoName, type, action, COUNT(1) AS events
            FROM github_events ge
            WHERE type IN ('PullRequestEvent', 'WatchEvent', 'IssuesEvent') AND created_at BETWEEN ? AND ?
            GROUP BY repo_id, type, action
            ORDER BY events DESC
            LIMIT ?, ?
        `,
      [from.toSQL(), to.toSQL(), offset, pageSize],
    );

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
      queue.push(event).catch((err) => {
        app.log.error(err, 'Failed to push event to queue.');
      });
    }

    if (queue.started) {
      await queue.drain();
    }

    page++;
  }
}

async function checkIssueReceivedMilestones (
  conn: PoolConnection,
  repoId: number,
): Promise<number> {
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
  repoId: number,
): Promise<number> {
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
  repoId: number,
): Promise<number> {
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
  repoId: number,
): Promise<number> {
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
