import * as path from 'path'
import * as dotenv from "dotenv";
import schedule from 'node-schedule';
import consola from "consola";
import cronParser from 'cron-parser';
import type {Params, QuerySchema} from '../../params.schema'
import {TiDBQueryExecutor} from "../../app/core/TiDBQueryExecutor";
import GHEventService from "../../app/services/GHEventService";
import CollectionService from '../../app/services/CollectionService';
import CacheBuilder from '../../app/core/cache/CacheBuilder';
import UserService from '../../app/services/UserService';
import { resolveCrons } from "../../app/utils/paramDefs";
import { getConnectionOptions } from '../../app/utils/db';
import { arrayDeepEquals } from '../../app/utils/array';
import { DEFAULT_QUEUE_NAME, JobScheduler, QueryJob } from './JobScheduler';
import { needPrefetch } from '../../app/core/Query';
import { loadQueries, loadPresets } from '../../app/core/QueryFactory';

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

// Init logger.
const logger = consola.withTag('prefetch');

// Generate a prefetch query job with passed parameters according to the query definition.
function getQueryJobs(queryName: string, queryDef: QuerySchema, presets: Record<string, string[]>, onlyParams: Record<string, any>): QueryJob[] {
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
    const cron = resolveCrons(paramCombine, refreshCron);
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
  // Init mysql client.
  const queryExecutor = new TiDBQueryExecutor(getConnectionOptions());

  // Init Cache Builder.
  const cacheBuilder = new CacheBuilder(true);

  // Init Services.
  const ghEventService = new GHEventService(queryExecutor);
  const collectionService = new CollectionService(queryExecutor, cacheBuilder);
  const userService = new UserService(queryExecutor, cacheBuilder);

  // Init job scheduler.
  const jobScheduler = new JobScheduler(queryExecutor, cacheBuilder, ghEventService, collectionService, userService);

  // Load metadata.
  const queries = await loadQueries();
  const presets = await loadPresets();
  const collections = await collectionService.getCollections();
  presets.collectionIds = collections.data.map((c) => {
    return c.id;
  });
  
  let onlyParams = {};
  if (process.env.PREFETCH_ONLY_PARAMS !== undefined && process.env.PREFETCH_ONLY_PARAMS != '') {
    onlyParams = JSON.parse(process.env.PREFETCH_ONLY_PARAMS);
  }

  // Generate prefetch jobs.
  for (const [queryName, queryDef] of Object.entries(queries)) {
    if (process.env.PREFETCH_ONLY_QUERY !== undefined && process.env.PREFETCH_ONLY_QUERY != '') {
      if (queryName !== process.env.PREFETCH_ONLY_QUERY) {
        continue;
      }
    }

    if(!needPrefetch(queryDef)) {
      logger.debug(`Skip prefetching query ${queryName}.`)
      continue;
    }

    const queryJobs = getQueryJobs(queryName, queryDef, presets, onlyParams);
    for (let queryJob of queryJobs) {
      let { queryName, refreshCron, params } = queryJob;

      if (process.env.PREFETCH_EXECUTE_IMMEDIATELY === '1') {
        jobScheduler.scheduleJob(queryJob);
        continue;
      } 

      if (refreshCron == null || refreshCron === '') {
        logger.warn(`Must provide refresh cron for query <${queryName}>.`);
        continue;
      } else if (refreshCron === '@once') {
        // TODO: support once prefetch.
        continue;
      } else if (refreshCron === '@hourly') {
        const minute = Math.floor(Math.random() * 60);
        refreshCron = `0 ${minute} */1 * * *`;
      } else if (refreshCron === '@daily') {
        refreshCron = `0 0 0 */1 * *`;
      } else if (refreshCron === '@collection-daily') {
        refreshCron = `0 0 7 * * *`;
      } else if (refreshCron === '@weekly') {
        refreshCron = `0 0 8 * * 1`;
      } else if (refreshCron === '@monthly') {
        refreshCron = `0 0 8 1 * *`;
      } else if (refreshCron === '@collection-monthly') {
        refreshCron = `0 0 7 1 * *`;
      } else if (refreshCron === '@yearly') {
        refreshCron = `0 0 6 1 1 *`;
      } else {
        // Check if cron expression is valid.
        const errors = cronParser.parseString(refreshCron).errors;
        if (errors !== undefined && Object.keys(errors).length > 0) {
          logger.warn(`Failed to resolve refresh cron for query <${queryName}> with params`, params, errors);
          continue;
        }
      }

      // Enqueue.
      schedule.scheduleJob({
        rule: refreshCron,
        tz: 'UTC'
      }, async () => {
        jobScheduler.scheduleJob(queryJob);
      });
    }
  }
}

main()
