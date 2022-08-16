import * as dotenv from "dotenv";
import consola, {FancyReporter} from "consola";
import { validateProcessEnv } from './app/env';
import { getConnectionOptions } from "./utils/db";
import schedule from 'node-schedule';
import { Connection, createConnection } from "mysql2";

// Load environments.
dotenv.config({ path: __dirname+'/.env.template', override: true });
dotenv.config({ path: __dirname+'/.env', override: true });

validateProcessEnv();

const CACHE_GC_CRON = process.env.CACHE_GC_CRON || '0 */1 * * * *';
const DEFAULT_STEPS = 10;
const NORMAL_TABLE_NAME = 'cache';
const CACHED_TABLE_NAME = 'cached_table_cache';

// Init logger.
const logger = consola.withTag('cache-gc');
logger.removeReporter();
logger.addReporter(new FancyReporter({
  dateFormat: 'YYYY:MM:DD HH:mm:ss'
}));

// Init TiDB client.
const conn = createConnection(getConnectionOptions());
logger.info(`Execute cache GC job according cron expression: ${CACHE_GC_CRON}`);

schedule.scheduleJob(CACHE_GC_CRON, async () => {
  logger.info(`Clearing expired cache for table <${NORMAL_TABLE_NAME}> ...`);
  while (true) {
    const affectedRows = await clearCache(conn, NORMAL_TABLE_NAME, DEFAULT_STEPS);
    if (affectedRows === 0) {
      break;
    }
  }
  
  logger.info(`Clearing expired cache for table <${CACHED_TABLE_NAME}> ...`);
  while (true) {
    const affectedRows = await clearCache(conn, CACHED_TABLE_NAME, DEFAULT_STEPS);
    if (affectedRows === 0) {
      break;
    }
  }

  logger.info('Finished the cache gc.');
});

function clearCache(conn: Connection, tableName: string, steps: number = 10):Promise<number> {
  return new Promise((resolve, reject) => {
    conn.execute<any>(`
      DELETE FROM ${tableName} ctc
      WHERE expires > 0 AND DATE_ADD(updated_at, INTERVAL expires SECOND) < CURRENT_TIME
      LIMIT ${steps};
    `, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.affectedRows || 0);
      }
    });
  });
}