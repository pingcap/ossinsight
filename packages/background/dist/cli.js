#!/usr/bin/env node
/**
 * Background Service CLI
 *
 * Usage:
 *   background-service start      - Start the scheduler
 *   background-service worker     - Start a worker process
 *   background-service status     - Show status
 */
import { getBackgroundService } from './index.js';
import { logger } from './logger.js';
async function main() {
    const command = process.argv[2] || 'start';
    switch (command) {
        case 'start':
            await startScheduler();
            break;
        case 'worker':
            await startWorker();
            break;
        case 'status':
            await showStatus();
            break;
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
        default:
            logger.error(`Unknown command: ${command}`);
            showHelp();
            process.exit(1);
    }
}
async function startScheduler() {
    logger.info('Starting Background scheduler...');
    const service = getBackgroundService();
    try {
        await service.start();
        logger.info('Background scheduler is running');
        // Keep process alive
        process.on('SIGINT', async () => {
            logger.info('Shutting down...');
            await service.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            logger.info('Shutting down...');
            await service.stop();
            process.exit(0);
        });
    }
    catch (error) {
        logger.error({ error }, 'Failed to start scheduler');
        process.exit(1);
    }
}
async function startWorker() {
    logger.info('Starting Background worker...');
    const service = getBackgroundService();
    try {
        await service.start();
        logger.info('Background worker is running');
        process.on('SIGINT', async () => {
            logger.info('Shutting down worker...');
            await service.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            logger.info('Shutting down worker...');
            await service.stop();
            process.exit(0);
        });
    }
    catch (error) {
        logger.error({ error }, 'Failed to start worker');
        process.exit(1);
    }
}
async function showStatus() {
    logger.info('Background service status: OK');
    console.log('Background service is configured and ready');
}
function showHelp() {
    console.log(`
Background Service CLI

Usage:
  background-service <command>

Commands:
  start     Start the scheduler (default)
  worker    Start a worker process
  status    Show service status
  help      Show this help message

Environment Variables:
  BACKGROUND_REDIS_URL         Redis connection URL (default: redis://localhost:6379)
  BACKGROUND_DATABASE_URL      Database connection URL (default: mysql://localhost:3306/ossinsight)
  BACKGROUND_WORKER_CONCURRENCY  Number of concurrent workers (default: 10)
  BACKGROUND_LOG_LEVEL         Log level (default: info)

Examples:
  background-service start
  background-service worker
  BACKGROUND_LOG_LEVEL=debug background-service start
`);
}
main().catch((error) => {
    logger.error({ error }, 'Fatal error');
    process.exit(1);
});
//# sourceMappingURL=cli.js.map