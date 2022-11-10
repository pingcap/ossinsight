import {
  CronJobDef,
  FastifyServer,
  JobName,
  RepoMilestoneToSent,
  User,
} from '../../types';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import { DateTime } from 'luxon';
import { FastifyInstance } from 'fastify';
import { MySQLPromisePool } from '@fastify/mysql';
import React from 'react';
import RepoMilestoneFeeds from '../../emails/RepositoryFeeds';
import fp from 'fastify-plugin';
import sendMail from '../../emails';

export const SEND_REPO_FEEDS_EMAILS_JOB_NAME = 'send-repo-feeds-emails';

export default fp(async (fastify: FastifyInstance) => {
  fastify.cron.createJob({
    name: SEND_REPO_FEEDS_EMAILS_JOB_NAME,
    cronTime: fastify.config.SEND_REPO_FEEDS_CRON,
    // Notice: do not use arrow function here, otherwise `this` will be undefined.
    onTick: async function (server: FastifyServer) {
      await sendRepoFeedsEmailsJobHandler.bind(this)(this.name!, server);
    },
    startWhenReady: true,
  });
});

export async function sendRepoFeedsEmailsJobHandler (
  this: CronJobDef,
  jobName: JobName,
  server: FastifyServer,
) {
  if (!jobName) {
    server.log.error(
      'Skip execution, must provide jobName for the handler.',
    );
    return;
  }

  // Init parameters.
  const parameters = server.jobParameters.get(jobName);
  const pageSize = 100;
  const jobParameters = Object.assign({}, parameters, {
    pageSize,
  });
  server.jobParameters.set(jobName, jobParameters);

  // Init statuses.
  server.jobStatuses.set(jobName, {
    page: 0,
    processEvents: 0,
  });

  server.log.info(jobParameters, 'Starting execute job %s.', jobName);

  try {
    let pageNum = 1;
    while (true) {
      const watchers = await getWatchers(server.mysql, pageNum, pageSize);
      if (!Array.isArray(watchers) || watchers.length === 0) {
        break;
      }

      for (const watcher of watchers) {
        await sendRepoFeedsToWatcher(server, watcher);
      }

      if (watchers.length < pageSize) {
        break;
      }

      pageNum++;
    }
  } catch (err) {
    server.log.error(err, 'Failed to execute %s job.', jobName);
  }
}

async function sendRepoFeedsToWatcher (server: FastifyServer, watcher: User) {
  const { id: watcherId, emailAddress, githubLogin } = watcher;
  let conn: PoolConnection | null = null;
  try {
    conn = await server.mysql.getConnection();
    await conn.beginTransaction();
    const repoMilestones = await getRepoMilestonesForUser(conn, watcherId);
    // Skip if there no new repo milestones.
    if (repoMilestones.length > 0) {
      const subject = `What happened on my watched repositories on ${DateTime.utc().toLocaleString(
                DateTime.DATE_FULL,
            )}?`;
      await sendEmailToWatcher(
        emailAddress,
        subject,
        githubLogin,
        repoMilestones,
      );
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

async function getWatchers (
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

async function getRepoMilestonesForUser (
  conn: PoolConnection,
  userId: number,
  page: number = 1,
  pageSize: number = 10,
): Promise<RepoMilestoneToSent[]> {
  const offset = (page - 1) * pageSize;
  const [rows] = await conn.query<RowDataPacket[]>(
        `
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
    `,
        [userId, offset, pageSize],
  );
  return rows as RepoMilestoneToSent[];
}

async function sendEmailToWatcher (
  emailAddress: string,
  subject: string,
  name: string,
  repoMilestones: RepoMilestoneToSent[],
) {
  await sendMail({
    subject,
    to: emailAddress,
    component: React.createElement(RepoMilestoneFeeds, {
      name,
      repoMilestones,
    }),
  });
}

async function markRepoMilestonesAsSent (
  conn: PoolConnection,
  repoMilestones: RepoMilestoneToSent[],
) {
  const [rs] = await conn.query<ResultSetHeader>(
        `
        INSERT INTO sys_sent_repo_milestones (user_id, repo_milestone_id)
        VALUES ?
        ON DUPLICATE KEY UPDATE user_id = user_id;
    `,
        repoMilestones.map((m) => [m.watchedUserId, m.milestoneId]),
  );
  return rs.affectedRows;
}
