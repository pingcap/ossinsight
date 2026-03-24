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
import { registerGharchiveTasks } from './tasks/gharchive.js';

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

class BackgroundServiceImpl implements BackgroundService {
  public scheduler: Orbital;
  private config: BackgroundConfig;
  private isRunning = false;

  constructor(config: BackgroundConfig) {
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

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Background service is already running');
      return;
    }

    try {
      await this.scheduler.start();
      this.isRunning = true;
      logger.info('Background service started');
    } catch (error) {
      logger.error({ error }, 'Failed to start Background service');
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.scheduler.stop();
      this.isRunning = false;
      logger.info('Background service stopped');
    } catch (error) {
      logger.error({ error }, 'Error stopping Background service');
      throw error;
    }
  }

  async enqueue<T>(taskType: string, data: T): Promise<string> {
    return this.scheduler.enqueue(taskType, data as Record<string, unknown>);
  }

  schedule(name: string, cron: string, handler: () => Promise<void>): void {
    this.scheduler.schedule(name, cron, handler);
  }
}

// Factory function
export function createBackgroundService(config: BackgroundConfig): BackgroundService {
  return new BackgroundServiceImpl(config);
}

// Default instance (lazy initialization)
let defaultService: BackgroundService | null = null;

export function getBackgroundService(): BackgroundService {
  if (!defaultService) {
    const config: BackgroundConfig = {
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
export * from './tasks/gharchive.js';

// Helper functions
function parseRedisUrl(url: string): { url: string } {
  return { url };
}

function parseDatabaseUrl(url: string): { url: string } {
  return { url };
}
