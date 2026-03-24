/**
 * OSS Insight Background Service
 *
 * Shared task scheduler service using @mini256/orbital
 * for distributed background job processing.
 */
import { Orbital } from '@mini256/orbital';
import { logger } from './logger.js';
import { registerGithubSyncTasks } from './tasks/github-sync.js';
import { registerPrefetchTasks } from './tasks/prefetch.js';
import { registerEtlTasks } from './tasks/etl.js';
class BackgroundServiceImpl {
    scheduler;
    config;
    isRunning = false;
    constructor(config) {
        this.config = {
            workerConcurrency: 10,
            logLevel: 'info',
            ...config,
        };
        this.scheduler = new Orbital({
            redis: parseRedisUrl(this.config.redisUrl),
            database: parseDatabaseUrl(this.config.databaseUrl),
        });
        // Register all task types
        registerGithubSyncTasks(this.scheduler);
        registerPrefetchTasks(this.scheduler);
        registerEtlTasks(this.scheduler);
        logger.info({ config: this.config }, 'Background service initialized');
    }
    async start() {
        if (this.isRunning) {
            logger.warn('Background service is already running');
            return;
        }
        try {
            await this.scheduler.start();
            this.isRunning = true;
            logger.info('Background service started');
        }
        catch (error) {
            logger.error({ error }, 'Failed to start Background service');
            throw error;
        }
    }
    async stop() {
        if (!this.isRunning) {
            return;
        }
        try {
            await this.scheduler.stop();
            this.isRunning = false;
            logger.info('Background service stopped');
        }
        catch (error) {
            logger.error({ error }, 'Error stopping Background service');
            throw error;
        }
    }
    async enqueue(taskType, data) {
        return this.scheduler.enqueue(taskType, data);
    }
    schedule(name, cron, handler) {
        this.scheduler.schedule(name, cron, handler);
    }
}
// Factory function
export function createBackgroundService(config) {
    return new BackgroundServiceImpl(config);
}
// Default instance (lazy initialization)
let defaultService = null;
export function getBackgroundService() {
    if (!defaultService) {
        const config = {
            redisUrl: process.env.BACKGROUND_REDIS_URL || 'redis://localhost:6379',
            databaseUrl: process.env.BACKGROUND_DATABASE_URL || 'mysql://localhost:3306/ossinsight',
            workerConcurrency: parseInt(process.env.BACKGROUND_WORKER_CONCURRENCY || '10', 10),
            logLevel: process.env.BACKGROUND_LOG_LEVEL || 'info',
        };
        defaultService = createBackgroundService(config);
    }
    return defaultService;
}
// Export task types
export * from './tasks/github-sync.js';
export * from './tasks/prefetch.js';
export * from './tasks/etl.js';
// Helper functions
function parseRedisUrl(url) {
    return { url };
}
function parseDatabaseUrl(url) {
    return { url };
}
//# sourceMappingURL=index.js.map