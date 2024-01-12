import { FastifyBaseLogger, FastifyInstance, FastifyTypeProviderDefault, RawServerDefault } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';

import { Params } from 'fastify-cron';
import {RowDataPacket} from "mysql2/promise";

export type FastifyServer = FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault>;

export type JobName = string;

export type CronJobDef = Params;

export type JobHandler = (this: CronJobDef, jobName: JobName, server: FastifyServer) => Promise<void>;

export interface GitHubRepoWithEvents extends RowDataPacket {
    index: number;
    repoId: number;
    repoName: string;
    type: string;
    action: string;
}

export interface User extends RowDataPacket {
    id: number;
    githubId: number;
    githubLogin: string;
    emailAddress: string;
}

export enum EventType {
    WATCH_EVENT = 'WatchEvent',
    ISSUES_EVENT = 'IssuesEvent',
    PULL_REQUEST_EVENT = 'PullRequestEvent',
}

export enum IssuesEventTypeAction {
    OPENED = 'opened',
    CLOSED = 'closed',
}

export enum PullRequestEventTypeAction {
    OPENED = 'opened',
    CLOSED = 'closed',
}

export enum MilestoneType {
    STARS_EARNED = 1,
    PULL_REQUEST_MERGED = 2,
    PULL_REQUEST_CREATORS_HAD = 3,
    ISSUES_RECEIVED = 4,
    SHOW_IN_TRENDING_REPOS = 5,
    ADDED_IN_COLLECTIONS = 6,
}

export const STARS_EARNED_STEPS = [100, 500, 1024, 2000, 5000, 10000, 20000, 50000, 100000, 200000];
export const PULL_REQUESTS_MERGED_STEPS = [1, 100, 500, 1024, 2000, 5000, 10000, 20000, 50000, 100000];
export const PULL_REQUEST_CREATORS_HAD_STEPS = [1, 50, 100, 500, 1024, 2000, 5000];
export const ISSUES_RECEIVED_STEPS = [1, 20, 100, 500, 1024, 2000, 5000, 10000, 50000, 100000];
