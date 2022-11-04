import { FastifyServer, RepoMilestoneToSent } from '../../types';
import { Prisma, PrismaClient } from '@prisma/client';

import { DateTime } from 'luxon';
import React from "react";
import RepoMilestoneFeeds from '../../emails/RepositoryFeeds';
import fp from 'fastify-plugin';
import sendMail from '../../emails';

export default fp(async (fastify) => {
    fastify.cron.createJob({
        name: 'send-repo-feeds-emails',
        cronTime: fastify.config.SEND_REPO_FEEDS_CRON,
        onTick: async (server) => {
            try {
                await sendRepoFeedsToWatchers(server);
            } catch(err) {
                server.log.error(err, 'Failed to send watched repo milestones feeds.');
            }
        }
    });
})

async function sendRepoFeedsToWatchers(server: FastifyServer) {
    let pageNum = 1;
    const pageSize = 100;
    while(true) {
        const watchers = await getWatchers(server.prisma, pageNum, pageSize);
        if (!Array.isArray(watchers) || watchers.length === 0) {
            break;
        }

        for (let watcher of watchers) {
            sendRepoFeedsToWatcher(server, watcher);
        }
        
        if (watchers.length < pageSize) {
            break;
        }

        pageNum++;
    }
}

async function sendRepoFeedsToWatcher(server: FastifyServer, watcher: Prisma.UserGetPayload<{}>) {
    const { id: watcherId, emailAddress, githubLogin } = watcher;
    try {
        await server.prisma.$transaction(async (prisma) => {
            const repoMilestones = await getRepoMilestonesForUser(prisma, watcherId);
            // Skip if there no new repo milestones.
            if (repoMilestones.length > 0) {
                const subject = `What happened on my watched repositories on ${DateTime.utc().toLocaleString(DateTime.DATE_FULL)}?`;
                await sendEmailToWatcher(emailAddress, subject, githubLogin, repoMilestones);
                await markRepoMilestonesAsSent(prisma, repoMilestones);
            }
        });
    } catch(err) {
        server.log.error(err, `Failed to send repository feeds to watcher ${watcherId}.`);
    }
}

async function getWatchers(prisma: PrismaClient, page: number = 1, pageSize: number = 10) {
    const offset = (page - 1) * pageSize;
    return await prisma.user.findMany({
        where: {
            emailGetUpdates: true,
            watchedRepos: {
                
            }
        },
        skip: offset,
        take: pageSize
    });
}

async function getRepoMilestonesForUser(
    prisma: Prisma.TransactionClient, userId: number, page: number = 1, pageSize: number = 10
):Promise<RepoMilestoneToSent[]> {
    const offset = (page - 1) * pageSize;
    return await prisma.$queryRaw<RepoMilestoneToSent[]>`
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
                swr.user_id = ${userId}
                AND ssm.user_id IS NULL     -- Exclude the sent milestones.
            ORDER BY srm.created_at DESC
            LIMIT ${offset}, ${pageSize}
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
    `;
}

async function sendEmailToWatcher(emailAddress: string, subject: string, name: string, repoMilestones: RepoMilestoneToSent[]) {
    await sendMail({
        subject: subject,
        to: emailAddress,
        component: React.createElement(RepoMilestoneFeeds, {
            name: name,
            repoMilestones: repoMilestones
        })
    });
}

async function markRepoMilestonesAsSent(prisma: Prisma.TransactionClient, repoMilestones: RepoMilestoneToSent[]) {
    return await prisma.sentRepoMilestone.createMany({
        data: repoMilestones.map((repoMilestone) => {
            return {
                repoMilestoneId: repoMilestone.milestoneId,
                userId: repoMilestone.watchedUserId
            }
        }),
        skipDuplicates: true
    });
}