import { FastifyBaseLogger, FastifyInstance, FastifyTypeProviderDefault, RawServerDefault } from "fastify";
import { IncomingMessage, ServerResponse } from "http";

export type FastifyServer = FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault>;

export interface GitHubRepoWithEvents {
    index: number;
    repoId: number;
    repoName: string;
    type: string;
    action: string;
}

export interface RepoMilestoneToSent {
    repoId: number;
    repoName: string;
    milestoneId: number;
    milestoneTypeId: number;
    milestoneTypeName: string;
    milestoneNumber: number;
    milestonePayload?: object;
    watchedUserId: number;
}

export enum EventType {
    WATCH_EVENT = 'WatchEvent',
    ISSUES_EVENT = 'IssuesEvent',
    PULL_REQUEST_EVENT = 'PullRequestEvent'
}

export enum IssuesEventTypeAction {
    OPENED = 'opened',
    CLOSED = 'closed'
}

export enum PullRequestEventTypeAction {
    OPENED = 'opened',
    CLOSED = 'closed'
}

export enum MilestoneType {
    STARS_EARNED = 1,
    PULL_REQUEST_MERGED = 2,
    PULL_REQUEST_CREATORS_HAD = 3,
    ISSUES_RECEIVED = 4,
    SHOW_IN_TRENDING_REPOS = 5,
    ADDED_IN_COLLECTIONS = 6
}

export const STARS_EARNED_STEPS = [100, 500, 1024, 2000, 5000, 10000, 20000, 50000, 100000, 200000];
export const PULL_REQUESTS_MERGED_STEPS = [1, 100, 500, 1024, 2000, 5000, 10000, 20000, 50000, 100000];
export const PULL_REQUEST_CREATORS_HAD_STEPS = [1, 50, 100, 500, 1024, 2000, 5000];
export const ISSUES_RECEIVED_STEPS = [1, 20, 100, 500, 1024, 2000, 5000, 10000, 50000, 100000];