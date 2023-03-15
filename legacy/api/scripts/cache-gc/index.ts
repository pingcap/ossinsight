import * as dotenv from "dotenv";
import * as path from 'path'
import consola from "consola";
import { ConnectionWrapper, getConnectionOptions } from "../../app/utils/db";
import schedule from 'node-schedule';

const DEFAULT_STEPS = 10;
const NORMAL_TABLE_NAME = 'cache';
const CACHED_TABLE_NAME = 'cached_table_cache';

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const cron = process.env.CACHE_GC_CRON || '0 */1 * * * *';

// Init logger.
const logger = consola.withTag('cache-gc');

// Init TiDB client.
const conn = new ConnectionWrapper(getConnectionOptions());

logger.info(`Execute cache GC job according cron expression: ${cron}`);
schedule.scheduleJob(cron, async () => {
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

function clearCache(conn: ConnectionWrapper, tableName: string, steps: number = 10):Promise<number> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await conn.execute<any>(`
        DELETE FROM ${tableName} ctc
        WHERE expires > 0 AND DATE_ADD(updated_at, INTERVAL expires SECOND) < CURRENT_TIME
        LIMIT ${steps};
      `);
      resolve(res.result.affectedRows || 0);
    } catch (err) {
      reject(err);
    }
  });
}