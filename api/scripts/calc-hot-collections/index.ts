import * as dotenv from "dotenv";
import * as path from 'path'
import {TiDBQueryExecutor} from "../../app/core/TiDBQueryExecutor";
import consola from "consola";
import Query from "../../app/core/Query";
import CacheBuilder from "../../app/core/cache/CacheBuilder";
import CollectionService, { Collection } from "../../app/services/CollectionService";
import GHEventService from "../../app/services/GHEventService";
import UserService from "../../app/services/UserService";
import schedule from 'node-schedule';
import { getConnectionOptions } from "../../app/utils/db";
import { createPool } from "mysql2/promise";
import async from "async";

const COLLECTIONS_RANKING_QUERY = 'collection-stars-month-rank';

// Init logger.
const logger = consola.withTag('calc-hot-collections');

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const concurrent = parseInt(process.env.CALC_HOT_COLLECTIONS_CONCURRENT || '5');

if (process.env.CALC_HOT_COLLECTIONS_EXECUTE_ONCE === '1') {
    calcHotCollectionsInConcurrent(concurrent);
} else {
    const cron = process.env.CALC_HOT_COLLECTIONS_CRON;
    if (cron === undefined || cron === '') {
        logger.error('Please provide the `CALC_HOT_COLLECTIONS_CRON` environment variable.');
        process.exit(-1);
    }
    logger.info(`Execute calc hot collections job according cron expression: ${cron}`);
    schedule.scheduleJob(cron, async () => {
        calcHotCollectionsInConcurrent(concurrent);
    });
}

async function calcHotCollectionsInConcurrent(concurrent: number) {
    // Init TiDB client.
    const pool = createPool(getConnectionOptions({
        connectionLimit: concurrent
    }));

    // Init TiDB Query Executor.
    const queryExecutor = new TiDBQueryExecutor(getConnectionOptions({
        connectionLimit: concurrent
    }));

    // Init Cache Builder; 
    const enableCache = process.env.ENABLE_CACHE === '1' ? true : false;
    const cacheBuilder = new CacheBuilder(enableCache);

    // Init Services.
    const collectionService = new CollectionService(queryExecutor, cacheBuilder);
    const userService = new UserService(queryExecutor, cacheBuilder);
    const ghEventService = new GHEventService(queryExecutor);

    // Init queue;
    const queue = async.queue<Collection>(async (collection) => {
        const { id: collectionId, name } = collection;
        const query = new Query(COLLECTIONS_RANKING_QUERY, cacheBuilder, queryExecutor, ghEventService, collectionService, userService)
        const { data: collection_items } = await query.execute({
            collectionId: collectionId
        }, false);
        
        if (Array.isArray(collection_items)) {
            logger.info(`Found ${collection_items.length} repos in the collection <${name}> ...`);
            for (const item of collection_items) {
                let sql;
                if (item.repo_id === undefined) {
                    // Fallback to use repo_name when repo_id is not existed.
                    sql = ` UPDATE collection_items
                    SET last_month_rank = ${item.current_month_rank}, last_2nd_month_rank =  ${item.last_month_rank}
                    WHERE collection_id = ${collectionId} AND repo_name = '${item.repo_name}'
                    `;
                } else {
                    sql = `UPDATE collection_items
                    SET last_month_rank = ${item.current_month_rank}, last_2nd_month_rank =  ${item.last_month_rank}
                    WHERE collection_id = ${collectionId} AND repo_id = '${item.repo_id}'
                    `;
                }
                pool.execute(sql);
            }
            logger.info(`Updated the month rank for collection <${name}>.`)
        }
    });

    logger.info("Loading collections...");
    const { data: collections } = await collectionService.getCollections();
    logger.info(`Found ${collections.length} collections, start calc collection's repos ranking.`);

    for (const collection of collections) {
        if (queue.started) {
            await queue.unsaturated();
        }
        queue.push(collection);
    }

    await queue.drain();
}
