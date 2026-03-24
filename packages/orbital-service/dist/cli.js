#!/usr/bin/env node
/**
 * Orbital Service CLI
 *
 * Usage:
 *   orbital-service start      - Start the scheduler
 *   orbital-service worker     - Start a worker process
 *   orbital-service status     - Show status
 */
import { getOrbitalService } from './index.js';
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
    logger.info('Starting Orbital scheduler...');
    const service = getOrbitalService();
    try {
        await service.start();
        logger.info('Orbital scheduler is running');
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
    logger.info('Starting Orbital worker...');
    const service = getOrbitalService();
    try {
        await service.start();
        logger.info('Orbital worker is running');
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
    logger.info('Orbital service status: OK');
    console.log('Orbital service is configured and ready');
}
function showHelp() {
    console.log(`
Orbital Service CLI

Usage:
  orbital-service <command>

Commands:
  start     Start the scheduler (default)
  worker    Start a worker process
  status    Show service status
  help      Show this help message

Environment Variables:
  ORBITAL_REDIS_URL         Redis connection URL (default: redis://localhost:6379)
  ORBITAL_DATABASE_URL      Database connection URL (default: mysql://localhost:3306/ossinsight)
  ORBITAL_WORKER_CONCURRENCY  Number of concurrent workers (default: 10)
  ORBITAL_LOG_LEVEL         Log level (default: info)

Examples:
  orbital-service start
  orbital-service worker
  ORBITAL_LOG_LEVEL=debug orbital-service start
`);
}
main().catch((error) => {
    logger.error({ error }, 'Fatal error');
    process.exit(1);
});
//# sourceMappingURL=cli.js.map