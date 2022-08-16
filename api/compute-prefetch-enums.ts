import * as path from 'path'
import * as fsp from 'fs/promises'
import * as dotenv from "dotenv";
import asyncPool from "tiny-async-pool";
import type {Params, QuerySchema} from './params.schema'
import {TiDBQueryExecutor} from "./app/core/TiDBQueryExecutor";
import Query from "./app/core/Query";
import consola from "consola";
import {DateTime, Duration} from "luxon";
import { validateProcessEnv } from './app/env';
import GHEventService from "./app/services/GHEventService";
import CollectionService from './app/services/CollectionService';
import CacheBuilder from './app/core/cache/CacheBuilder';
import UserService from './app/services/UserService';
import { resolveHours } from "./utils/paramDefs";
import { getConnectionOptions } from './utils/db';
import sleep from './utils/sleep';
import { arrayDeepEquals } from './utils/array';

// Load environments.
dotenv.config({ path: __dirname+'/.env.template' });
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
  // Init mysql client.
  const queryExecutor = new TiDBQueryExecutor(getConnectionOptions());

  // Init Cache Builder.
  const cacheBuilder = new CacheBuilder(true);

  // Init Services.
  const ghEventService = new GHEventService(queryExecutor);
  const collectionService = new CollectionService(queryExecutor, cacheBuilder);
  const userService = new UserService(queryExecutor, cacheBuilder);

  logger.info("Ready Go...")
  for (let i = 0; i < Number.MAX_VALUE; i++) {
    logger.info(`Compute round ${i + 1}.`)
    const queries = await getQueries();
    const presets = await getPresets();
    await prefetchQueries(queryExecutor, cacheBuilder, ghEventService, collectionService, userService, queries, presets);
    logger.info('Next round prefetch will come at: %s', DateTime.now().plus(Duration.fromObject({ minutes: 2 })))
    await sleep(1000 * 60 * 2);    // sleep 2 minutes.
  }
}

async function prefetchQueries(
  queryExecutor: TiDBQueryExecutor,
  cacheBuilder: CacheBuilder,
  ghEventService: GHEventService,
  collectionService: CollectionService,
  userService: UserService,
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
        refreshHours: resolveHours(paramCombine, queryDef.refreshHours),
        params: paramCombine
      })
    }

    // Notice: Queries without parameters are treated as pre-cached queries by default.
    if (queryDef.params.length === 0) {
      queryJobs.push({
        queryName: queryName,
        refreshHours: resolveHours({}, queryDef.refreshHours),
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
    const query = new Query(queryName, cacheBuilder, queryExecutor, ghEventService, collectionService, userService)
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
  const cost = (end.getTime() - start.getTime()) / 1000;
  logger.success("Finished all prefetch query jobs, start at: %s, end at: %s, cost: %d s.", start, end, cost);
}

main()
