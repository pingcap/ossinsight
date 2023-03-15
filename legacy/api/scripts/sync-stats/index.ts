import * as dotenv from "dotenv";
import * as path from 'path'
import consola from "consola";
import { getConnectionOptions } from "../../app/utils/db";
import schedule from 'node-schedule';
import { DateTime } from "luxon";
import { createPool, ResultSetHeader } from "mysql2";

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const cron = process.env.SYNC_STATS_CRON || '*/5 * * * * *';

// Init logger.
const logger = consola.withTag('sync-stats');

// Init TiDB client.
const conn = createPool(getConnectionOptions({
  connectionLimit: 1
})).promise();

const sql = `INSERT INTO stats_index_summary (summary_begin_time, summary_end_time, table_name, index_name, digest, plan_digest, exec_count)
WITH RECURSIVE numbers (n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 
    FROM numbers 
    WHERE n < 10
)
SELECT
    SUMMARY_BEGIN_TIME,
    SUMMARY_END_TIME,
    SUBSTRING_INDEX(
        SUBSTRING_INDEX(SUBSTRING_INDEX(s.INDEX_NAMES, ',', numbers.n), ',', -1),
        ':',
        1  
    ) AS TABLE_NAME,
    SUBSTRING_INDEX(
        SUBSTRING_INDEX(SUBSTRING_INDEX(s.INDEX_NAMES, ',', numbers.n), ',', -1),
        ':',
        -1
    ) AS INDEX_NAME,
    DIGEST,
    PLAN_DIGEST,
    EXEC_COUNT
FROM INFORMATION_SCHEMA.STATEMENTS_SUMMARY s
JOIN numbers ON CHAR_LENGTH(s.INDEX_NAMES) - CHAR_LENGTH(REPLACE(s.INDEX_NAMES, ',', '')) >= numbers.n - 1
WHERE SCHEMA_NAME = database()
ON DUPLICATE KEY UPDATE exec_count = GREATEST(IFNULL(stats_index_summary.exec_count, 0), IFNULL(VALUES(exec_count), 0))
;`;

logger.info(`Execute sync stats job according cron expression: ${cron}`);
schedule.scheduleJob(cron, async () => {
  logger.info(`Syncing statement stats from INFORMATION_SCHEMA.STATEMENTS_SUMMARY table to stats_index_summary table ...`);

  try {
    const [rs] = await conn.execute<ResultSetHeader>(sql);
    logger.success(`Synced ${rs.affectedRows} SQL statement stats records at ${DateTime.utc().toISO()}.`);
  } catch (err) {
    logger.error(`Failed to sync SQL statement stats at ${DateTime.utc().toISO()}: `, err);
  }
});
