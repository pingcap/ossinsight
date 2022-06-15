import * as path from 'path'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import * as dotenv from "dotenv";
import asyncPool from "tiny-async-pool";
import type {Params, QuerySchema} from './params.schema'
import {TiDBQueryExecutor} from "./app/core/TiDBQueryExecutor";
import Query from "./app/core/Query";
import {createClient} from "redis";
import consola, {JSONReporter} from "consola";
import {DateTime, Duration} from "luxon";
import { validateProcessEnv } from './app/env';
import GHEventService from "./app/services/GHEventService";
import CollectionService from './app/services/CollectionService';
import CacheBuilder from './app/core/cache/CacheBuilder';

// Load environments.
dotenv.config({ path: __dirname+'/.env.template', override: true });
dotenv.config({ path: __dirname+'/.env', override: true });

validateProcessEnv()

const PREFETCH_CONCURRENT = process.env.PREFETCH_CONCURRENT ? parseInt(process.env.PREFETCH_CONCURRENT) : 3;

const logger = consola.withTag('prefetch');

interface QueryJob {
  id?: number,
  queryName: string;
  refreshHours: number,
  params: {
    [key:string]: string;
  }
}

async function getQueries(): Promise<Record<string, QuerySchema>> {
  const base = path.join(process.cwd(), 'queries')
  const paths = await fsp.readdir(base)
  const res: Record<string, QuerySchema> = {}
  for (let p of paths) {
    res[p] = JSON.parse(await fsp.readFile(path.join(base, p, "params.json"), {encoding: "utf-8"}))
  }
  return res
}

async function getPresets(): Promise<Record<string, string[]>> {
  return JSON.parse(await fsp.readFile(path.join(process.cwd(), 'params-preset.json'), { encoding: "utf-8" }))
}

async function main () {
  // Init logger.
  const today = new Date();
  let logFilename = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.log`
  await fsp.mkdir(path.join(__dirname, "log"), { recursive: true })
  const writeStream = fs.createWriteStream(path.join(__dirname, "log", logFilename), {
    flags: 'a'
  });
  let logFileReporter = new JSONReporter({ stream: writeStream });
  logger.addReporter(logFileReporter);

  // Log files sorted by day.
  // Check every 60 seconds if a new log file needs to be created to store log information.
  setInterval(() => {
    const today = new Date();
    const newFilename = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}.log`
    if (logFilename !== newFilename) {
      logFilename = newFilename;
      const writeStream = fs.createWriteStream(path.join(__dirname, "log", logFilename), {
        flags: 'a'
      });
      logger.removeReporter(logFileReporter);
      logFileReporter = new JSONReporter({ stream: writeStream });
      logger.addReporter(logFileReporter);
    }
  }, 60);

  // Init redis client.
  const redisClient = createClient({
    url: process.env.REDIS_URL
  });
  await redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();

  // Init mysql client.
  const queryExecutor = new TiDBQueryExecutor({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    queueLimit: 10,
    decimalNumbers: true
  });

  // Init Cache Builder.
  const cacheBuilder = new CacheBuilder(redisClient, queryExecutor);

  // Init Services.
  const ghEventService = new GHEventService(queryExecutor);
  const collectionService = new CollectionService(queryExecutor, cacheBuilder);

  logger.info("Ready Go...")
  for (let i = 0; i < Number.MAX_VALUE; i++) {
    logger.info(`Compute round ${i + 1}.`)
    const queries = await getQueries();
    const presets = await getPresets();
    await prefetchQueries(queryExecutor, cacheBuilder, ghEventService, collectionService, queries, presets);
    logger.info('Next round prefetch will come at: %s', DateTime.now().plus(Duration.fromObject({ minutes: 1 })))
    await sleep(1000 * 60 * 1);    // sleep 30 minutes.
  }
}

async function prefetchQueries(
  queryExecutor: TiDBQueryExecutor,
  cacheBuilder: CacheBuilder,
  ghEventService: GHEventService,
  collectionService: CollectionService,
  queries: Record<string, QuerySchema>,
  presets: Record<string, string[]>
) {
  const queryJobs: QueryJob[] = [];

  for (const [queryName, queryDef] of Object.entries(queries)) {
    if(queryDef.params.find(param => !param.enums) && queryDef.params.length !== 0) {
      logger.debug(`Skip prefetching query ${queryName}.`)
      continue;
    }

    // Calc to get all the combine of parameters.
    let paramCombines = queryDef.params.reduce( (result: Record<string, any>[], param: Params) => {
      const key = param.name
      const enums = param.enums
      let options: any[] = [];
      if (typeof enums === 'string') {
        options = presets[enums]
      } else if (enums) {
        options = enums
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

    // Filter out to get the combinations that satisfy the restrictions.
    const restrictions = queryDef.restrictions;
    if (Array.isArray(restrictions) && restrictions.length > 0) {
      paramCombines = paramCombines.filter((paramCombine) => {
        // Notice: All restrictions must be met.
        return restrictions.every((restriction) => {
          const values = restriction.fields.map((field) => paramCombine[field]);
          // If it can match a certain combination of parameters, the restriction is satisfied.
          if (restriction.enums.some((enumValues) => arrayDeepEquals(values, enumValues))) {
            return true;
          }
        })
      })
    }

    logger.info(`Create prefetch job for query %s with %d params combines.`, queryName, paramCombines.length)


    for (let paramCombine of paramCombines) {
      queryJobs.push({
        queryName: queryName,
        refreshHours: queryDef.refreshHours || -1,
        params: paramCombine
      })
    }

    // Notice: Queries without parameters are treated as pre-cached queries by default.
    if (queryDef.params.length === 0) {
      queryJobs.push({
        queryName: queryName,
        refreshHours: queryDef.refreshHours || -1,
        params: {}
      })
    }
  }

  // Notice: Prioritize query jobs that require frequent updates.
  let jobID = 1;
  queryJobs.sort((a, b) => {
    return a.refreshHours - b.refreshHours;
  }).map((job) => {
    job.id = jobID++;
  })

  logger.info('Prefetch jobs: %d', queryJobs.length)

  const n = queryJobs.length;
  const start = new Date();
  await asyncPool(PREFETCH_CONCURRENT, queryJobs, async ({ id, queryName, params }) => {
    const qStart = new Date();
    // Do query with the rest parameter combines.
    logger.info("[%d/%d] PreFetch query %s with params: %s", id, n, queryName, JSON.stringify(params));
    const query = new Query(queryName, cacheBuilder, queryExecutor, ghEventService, collectionService)
    try {
      await query.run(params,true)
    } catch (err) {
      logger.error('[%d/%d] Failed to prefetch query %s with params: %s', id, n, queryName, JSON.stringify(params), err)
      logger.error('[%d/%d] Failed raw url: %s', id, n, (err as any)?.rawSql?.replace(/\n/g, ' '))
    }
    const qEnd = new Date();

    // Output the statistics info.
    const qCostTime = (qEnd.getTime() - qStart.getTime()) / 1000;
    logger.success("[%d/%d] Finish prefetch %s, start at: %s, end at: %s, cost: %d s", id, n, queryName, qStart, qEnd, qCostTime);
  });
  const end = new Date();
  const cost = end.getTime() - start.getTime();
  logger.success("Finished all prefetch query jobs, start at: %s, end at: %s, cost: %d s.", start, end, cost);
}

function arrayDeepEquals(values: any[], compareValues: any[]) {
  if (!(Array.isArray(values) && Array.isArray(compareValues))) return false;
  if (values.length != compareValues.length) return false;
  for (const i in values) {
    if (values[i] != compareValues[i]) {
      return false;
    }
  }
  return true;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main().then()
