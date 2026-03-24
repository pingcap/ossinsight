/**
 * OSS Insight Orbital Service
 *
 * Shared task scheduler service using @mini256/orbital
 * for distributed background job processing.
 */
import { Orbital } from '@mini256/orbital';
export interface OrbitalConfig {
    redisUrl: string;
    databaseUrl: string;
    workerConcurrency?: number;
    logLevel?: string;
}
export interface OrbitalService {
    scheduler: Orbital;
    start(): Promise<void>;
    stop(): Promise<void>;
    enqueue<T>(taskType: string, data: T): Promise<string>;
    schedule(name: string, cron: string, handler: () => Promise<void>): void;
}
export declare function createOrbitalService(config: OrbitalConfig): OrbitalService;
export declare function getOrbitalService(): OrbitalService;
export * from './tasks/github-sync.js';
export * from './tasks/prefetch.js';
export * from './tasks/etl.js';
//# sourceMappingURL=index.d.ts.map