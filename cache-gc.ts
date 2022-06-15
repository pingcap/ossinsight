import * as dotenv from "dotenv";
import {TiDBQueryExecutor} from "./app/core/TiDBQueryExecutor";
import {createClient} from "redis";
import consola, {FancyReporter} from "consola";
import {DateTime, Duration} from "luxon";
import { validateProcessEnv } from './app/env';
import CacheBuilder from './app/core/cache/CacheBuilder';

// Load environments.
dotenv.config({ path: __dirname+'/.env.template', override: true });
dotenv.config({ path: __dirname+'/.env', override: true });

validateProcessEnv()

const logger = consola.withTag('prefetch');

async function main () {
  // Init logger.
  logger.removeReporter();
  logger.addReporter(new FancyReporter({
    dateFormat: 'YYYY:MM:DD HH:mm:ss'
  }));

  // Init redis client.
  const redisClient = createClient({
    url: process.env.REDIS_URL
  });
  await redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();

  // Init TiDB client.
  const queryExecutor = new TiDBQueryExecutor({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    queueLimit: 10,
    decimalNumbers: true
  });

  logger.info("Ready Go...")
  for (let i = 0; i < Number.MAX_VALUE; i++) {
    logger.info(`Compute round ${i + 1}.`);

    // Clear expired cache.
    queryExecutor.execute(`DELETE FROM cache ctc
    WHERE expires > 0 AND DATE_ADD(updated_at, INTERVAL expires SECOND) < CURRENT_TIME;`);

    queryExecutor.execute(`DELETE FROM cached_table_cache ctc
    WHERE expires > 0 AND DATE_ADD(updated_at, INTERVAL expires SECOND) < CURRENT_TIME;`);

    logger.info('Next round prefetch will come at: %s', DateTime.now().plus(Duration.fromObject({ minutes: 1 })));
    await sleep(1000 * 20 * 1);    // sleep 20 minutes.
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main().then()
