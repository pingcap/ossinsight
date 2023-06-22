import {
  CacheBuilder,
  CollectionService,
  QueryLoader,
  QueryParser,
  QueryRunner,
  TiDBQueryExecutor
} from "@ossinsight/api-server";
import {Command} from "commander";
import {CronJob} from 'cron';
import envSchema from "env-schema";
import * as http from "http";
import {createPool, Pool} from "mysql2/promise";
import pino from "pino";
import {collectDefaultMetrics, Registry} from "prom-client";
import {AppConfig, PrefetchEnvSchema} from "./env";
import {JobGenerator} from "./job/generator";
import {JobScheduler} from "./job/scheduler";
import {prefetchQueryCounter, prefetchQueryTimer, queueWaitsGauge} from "./metrics";

// Load environments.
const config: AppConfig = envSchema({
  schema: PrefetchEnvSchema,
  dotenv: true,
});

// Init logger.
const logger = pino({
  transport: {
    target: 'pino-pretty',
  }
});

export interface Options {
  onlyPrefetch?: string;
  onlyParams?: Record<string, any>;
  once: boolean;
}

async function main() {
  const program = new Command();
  program.name('prefetch')
    .description('Prefetch will responsible for generating and scheduling pre-querying jobs.')
    .option<string>(
      '--only-prefetch <string>',
      'Only prefetch the specified query.',
      (value) => String(value)
    )
    .option<Record<string, any>>(
      '--only-params <params>',
      'Only prefetch the query with specified params.',
      (value) => JSON.parse(value)
    )
    .option('--once', 'Only prefetch once.')
    .action(prefetch)
    .version('0.1.0');

  program.parse();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});

async function prefetch(options: Options) {
  // Init tidb connection pool.
  const pool = await createPool({
    uri: config.DATABASE_URL
  })

  // Init shadow tidb connection pool.
  let shadowPool: Pool | undefined;
  if (config.SHADOW_DATABASE_URL) {
    shadowPool = await createPool({
      uri: config.SHADOW_DATABASE_URL
    });
  }

  // Init metrics server.
  const register = new Registry();
  register.registerMetric(queueWaitsGauge);
  register.registerMetric(prefetchQueryCounter);
  register.registerMetric(prefetchQueryTimer);
  collectDefaultMetrics({
    register,
    labels: {NODE_APP_INSTANCE: process.env.NODE_APP_INSTANCE}
  });

  http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      res.writeHead(200, {'Content-Type': register.contentType});
      res.end(await register.metrics());
    } else {
      res.writeHead(404);
      res.end();
    }
  }).listen(30002);

  // Init query executor.
  const tidbQueryExecutor = new TiDBQueryExecutor(pool, shadowPool, logger);

  // Init Cache Builder.
  const cacheBuilder = new CacheBuilder(logger, true, pool, shadowPool);

  // Init collection service.
  const collectionService = new CollectionService(logger, tidbQueryExecutor, cacheBuilder);

  // Init query runner.
  const queryLoader = new QueryLoader(logger);
  const queryParser = new QueryParser();
  const queryRunner = new QueryRunner(queryLoader, queryParser, cacheBuilder, tidbQueryExecutor);

  // Load metadata.
  const queries = await queryLoader.loadQueries();
  const presets = await queryLoader.loadPresets();
  const collections = await collectionService.getCollections();
  presets.collectionIds = collections.data.map((c) => {
    return c.id;
  });

  // Init job generator.
  const jobGenerator = new JobGenerator(logger, presets, queries);

  // Init job scheduler.
  const jobScheduler = new JobScheduler(logger, queryRunner);

  // Convert queries to prefetch jobs.
  Object.entries(queries)
    .filter(([queryName, queryDef]) => {
      return options.onlyPrefetch ? queryName === options.onlyPrefetch : true;
    }).filter(([queryName, queryDef]) => {
      return queryDef.refreshCron || options.once;
    })
    .map(([queryName, queryDef]) => {
      return jobGenerator.generate(queryName, options.onlyParams);
    })
    // Flatten the array.
    .reduce((arr, job) => arr.concat(job), [])
    .forEach((prefetchJob) => {
      if (options.once) {
        jobScheduler.scheduleJob(prefetchJob).then(null).catch((err) => {
          logger.error(err, `❌ Failed to execute prefetch job (once mode) for query ${prefetchJob.queryName}.`);
        });
        return;
      } else {
        return new CronJob(
          prefetchJob.refreshCron,
          function () {
            jobScheduler.scheduleJob(prefetchJob).then(null).catch((err) => {
              logger.error(err, `❌ Failed to execute prefetch job (cron mode) for query ${prefetchJob.queryName}.`);
            });
          },
          null,
          true,
          'UTC'
        );
      }
    });
}
