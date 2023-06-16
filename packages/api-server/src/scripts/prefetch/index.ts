import {createPool, Pool} from "mysql2/promise";
import schedule from 'node-schedule';
import cronParser from 'cron-parser';
import {Params, QuerySchema} from "../../types/query.schema";
import pino from "pino";
import envSchema from "env-schema";
import {APIServerEnvSchema} from "../../env";
import {TiDBQueryExecutor} from "../../core/executor/query-executor/TiDBQueryExecutor";
import {AppConfig} from "../../app";
import CacheBuilder from "../../core/cache/CacheBuilder";
import {DEFAULT_QUEUE_NAME, JobScheduler, QueryJob} from "./JobScheduler";
import {QueryLoader} from "../../core/runner/query/QueryLoader";
import {QueryParser} from "../../core/runner/query/QueryParser";
import {QueryRunner} from "../../core/runner/query/QueryRunner";
import {CollectionService} from "../../plugins/services/collection-service";

// Load environments.
const config: AppConfig = envSchema({
  schema: APIServerEnvSchema,
  dotenv: true,
});

// Init logger.
const logger = pino({
  transport: {
    target: 'pino-pretty',
  }
});

// Generate a prefetch query job with passed parameters according to the query definition.
function getQueryJobs(queryParer: QueryParser, queryName: string, queryDef: QuerySchema, presets: Record<string, string[]>, onlyParams: Record<string, any>): QueryJob[] {
  const queryJobs: QueryJob[] = [];
  const { params, refreshQueue = DEFAULT_QUEUE_NAME, refreshCron } = queryDef;

  // Notice: Queries without parameters are treated as pre-cached queries by default.
  let paramCombines = [];
  if (params.length === 0) {
    paramCombines = [{}];
  } else {
    paramCombines = getParamCombines(params, presets, onlyParams);
  }

  logger.info(
    `Create prefetch job for query <%s> in queue <%s> with %d params combines.`, 
    queryName, refreshQueue,paramCombines.length
  )
  for (let paramCombine of paramCombines) {
    const cron = queryParer.resolveCrons(paramCombine, refreshCron);
    if (cron === undefined) {
      logger.error(`Can not resolve refresh cron for query ${queryName}.`, paramCombine, refreshCron)
      return queryJobs;
    }

    queryJobs.push({
      queryName: queryName,
      refreshQueue: refreshQueue,
      refreshCron: cron,
      params: paramCombine
    })
  }

  return queryJobs;
}

function getParamCombines(params: Params[], presets: Record<string, string[]>, onlyParams: Record<string, any>) {
    // Calc to get all the combine of parameters.
    let paramCombines = params.reduce( (result: Record<string, any>[], param: Params) => {
      const key = param.name
      const enums = param.enums
      let options: any[] = [];

      if (onlyParams[key]) {
        options.push(onlyParams[key]);
      } else {
        if (typeof enums === 'string') {
          options = presets[enums]
        } else if (enums) {
          options = enums
        }
      }
  
      return options.reduce( (acc: any[], value: string) => {
        if (!result.length) {
          return acc.concat({ [key]: value });
        }
        return acc.concat(
          result.map( ele => (
            Object.assign({}, ele, { [key]: value })
          ))
        );
      }, []);
    }, []);

    return paramCombines;
}

async function main () {
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

  // Init query executor.
  const tidbQueryExecutor = new TiDBQueryExecutor(pool, shadowPool, logger, true);

  // Init Cache Builder.
  const cacheBuilder = new CacheBuilder(logger, config.ENABLE_CACHE, pool, shadowPool);

  // Init collection service.
  const collectionService = new CollectionService(logger, tidbQueryExecutor, cacheBuilder);

  // Init query runner.
  const queryLoader = new QueryLoader(logger);
  const queryParser = new QueryParser();
  const queryRunner = new QueryRunner(queryLoader, queryParser, cacheBuilder, tidbQueryExecutor);

  // Init job scheduler.
  const jobScheduler = new JobScheduler(logger, queryRunner);

  // Load metadata.
  const queries = await queryLoader.loadQueries();
  const presets = await queryLoader.loadPresets();
  const collections = await collectionService.getCollections();
  presets.collectionIds = collections.data.map((c) => {
    return c.id;
  });

  // Generate prefetch jobs.
  for (const [queryName, queryDef] of Object.entries(queries)) {
    if (config.PREFETCH_ONLY_QUERY !== undefined && queryName !== config.PREFETCH_ONLY_QUERY) {
      continue;
    }

    if(!queryDef.refreshCron) {
      logger.debug(`Skip prefetching query ${queryName}.`)
      continue;
    }

    const queryJobs = getQueryJobs(queryParser, queryName, queryDef, presets, config.PREFETCH_ONLY_PARAMS);
    for (const queryJob of queryJobs) {
      const { queryName, refreshCron } = queryJob;

      if (config.PREFETCH_EXECUTE_IMMEDIATELY) {
        await jobScheduler.scheduleJob(queryJob);
        continue;
      } 

      // Verify cron.
      const cronOrErrors = verifyCron(refreshCron);
      if (cronOrErrors === null) {
        logger.info(`Skip prefetching query ${queryName} cause refreshCron is empty.`);
        continue;
      } else if (typeof cronOrErrors === 'object') {
        logger.error({ errors: cronOrErrors }, `Skip prefetching query ${queryName} cause refreshCron is invalid.`);
        continue;
      }

      // Enqueue.
      await schedule.scheduleJob({
        rule: cronOrErrors,
        tz: 'UTC'
      }, async () => {
        await jobScheduler.scheduleJob(queryJob);
      });
    }
  }
}

function verifyCron(cron: string) {
  if (cron == null || cron === '') {
    return null;
  } else if (cron === '@once') {
    return null;
  } else if (cron === '@hourly') {
    const minute = Math.floor(Math.random() * 60);
    return `0 ${minute} */1 * * *`;
  } else if (cron === '@daily') {
    return `0 0 0 */1 * *`;
  } else if (cron === '@collection-daily') {
    return `0 0 7 * * *`;
  } else if (cron === '@weekly') {
    return `0 0 8 * * 1`;
  } else if (cron === '@monthly') {
    return `0 0 8 1 * *`;
  } else if (cron === '@collection-monthly') {
    return `0 0 7 1 * *`;
  } else if (cron === '@yearly') {
    return `0 0 6 1 1 *`;
  } else {
    // Check if cron expression is valid.
    const errors = cronParser.parseString(cron).errors;
    if (errors !== undefined && Object.keys(errors).length > 0) {
      return errors;
    } else {
      return cron;
    }
  }
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
