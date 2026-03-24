/**
 * OSS Insight Background Service
 *
 * Shared task scheduler service using @mini256/orbital
 * for distributed background job processing.
 */
import { Orbital } from '@mini256/orbital';
export interface BackgroundConfig {
    redisUrl: string;
    databaseUrl: string;
    workerConcurrency?: number;
    logLevel?: string;
}
export interface BackgroundService {
    scheduler: Orbital;
    start(): Promise<void>;
    stop(): Promise<void>;
    enqueue<T>(taskType: string, data: T): Promise<string>;
    schedule(name: string, cron: string, handler: () => Promise<void>): void;
}
export declare function createBackgroundService(config: BackgroundConfig): BackgroundService;
export declare function getBackgroundService(): BackgroundService;
export * from './tasks/github-sync.js';
export * from './tasks/prefetch.js';
export * from './tasks/etl.js';
//# sourceMappingURL=index.d.ts.map