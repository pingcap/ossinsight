/**
 * OSS Insight Orbital Service
 * 
 * Shared task scheduler service using @mini256/orbital
 * for distributed background job processing.
 */

import { Orbital } from '@mini256/orbital';
import { logger } from './logger.js';
import { registerGithubSyncTasks } from './tasks/github-sync.js';
import { registerPrefetchTasks } from './tasks/prefetch.js';
import { registerEtlTasks } from './tasks/etl.js';

export interface OrbitalConfig {
  redisUrl: string;
  databaseUrl: string;
  workerConcurrency?: number;
  logLevel?: string;
}

function parseRedisUrl(url: string): { url: string } {
  return { url };
}

function parseDatabaseUrl(url: string): { url: string } {
  return { url };
}

export interface OrbitalService {
  scheduler: Orbital;
  start(): Promise<void>;
  stop(): Promise<void>;
  enqueue<T>(taskType: string, data: T): Promise<string>;
  schedule(name: string, cron: string, handler: () => Promise<void>): void;
}

class OrbitalServiceImpl implements OrbitalService {
  public scheduler: Orbital;
  private config: OrbitalConfig;
  private isRunning = false;

  constructor(config: OrbitalConfig) {
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

    logger.info({ config: this.config }, 'Orbital service initialized');
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Orbital service is already running');
      return;
    }

    try {
      await this.scheduler.start();
      this.isRunning = true;
      logger.info('Orbital service started');
    } catch (error) {
      logger.error({ error }, 'Failed to start Orbital service');
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
      logger.info('Orbital service stopped');
    } catch (error) {
      logger.error({ error }, 'Error stopping Orbital service');
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
export function createOrbitalService(config: OrbitalConfig): OrbitalService {
  return new OrbitalServiceImpl(config);
}

// Default instance (lazy initialization)
let defaultService: OrbitalService | null = null;

export function getOrbitalService(): OrbitalService {
  if (!defaultService) {
    const config: OrbitalConfig = {
      redisUrl: process.env.ORBITAL_REDIS_URL || 'redis://localhost:6379',
      databaseUrl: process.env.ORBITAL_DATABASE_URL || 'mysql://localhost:3306/ossinsight',
      workerConcurrency: parseInt(process.env.ORBITAL_WORKER_CONCURRENCY || '10', 10),
      logLevel: process.env.ORBITAL_LOG_LEVEL || 'info',
    };
    defaultService = createOrbitalService(config);
  }
  return defaultService;
}

// Export task types
export * from './tasks/github-sync.js';
export * from './tasks/prefetch.js';
export * from './tasks/etl.js';
