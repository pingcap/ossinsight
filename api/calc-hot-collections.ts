import * as dotenv from "dotenv";
import {TiDBQueryExecutor} from "./app/core/TiDBQueryExecutor";
import consola, {FancyReporter} from "consola";
import { validateProcessEnv } from './app/env';
import Query from "./app/core/Query";
import CacheBuilder from "./app/core/cache/CacheBuilder";
import CollectionService from "./app/services/CollectionService";
import GHEventService from "./app/services/GHEventService";
import UserService from "./app/services/UserService";
import { createConnection } from "mysql2";
import schedule from 'node-schedule';
import sleep from "./utils/sleep";

const COLLECTIONS_RANKING_QUERY = 'collection-stars-month-rank';

// Init logger.
const logger = consola.withTag('calc-hot-collections');
logger.removeReporter();
logger.addReporter(new FancyReporter({
  dateFormat: 'YYYY:MM:DD HH:mm:ss'
}));

// Load environments.
dotenv.config({ path: __dirname+'/.env.template', override: true });
dotenv.config({ path: __dirname+'/.env', override: true });

validateProcessEnv()

const cron = process.env.CALC_HOT_COLLECTIONS_CRON;
if (cron === undefined || cron === '') {
    logger.error('Please provide the `CALC_HOT_COLLECTIONS_CRON` environment variable.');
    process.exit(-1);
}

const interval = parseInt(process.env.CALC_HOT_COLLECTIONS_INTERVAL || '30');

// Notice: node-schedule does not support concurrency control, 
// so it is best not to set the interval of cron expressions too close.
schedule.scheduleJob(cron, async () => {
    // Init TiDB client.
    const conn = createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '4000'),
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        queueLimit: 10,
        decimalNumbers: true,
        timezone: 'Z'
    });

    // Init TiDB Query Executor.
    const queryExecutor = new TiDBQueryExecutor({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectionLimit: 1,
        queueLimit: 10,
        decimalNumbers: true,
        timezone: 'Z'
    });

    // Init Cache Builder; 
    const enableCache = process.env.ENABLE_CACHE === '1' ? true : false;
    const cacheBuilder = new CacheBuilder(queryExecutor, enableCache);

    // Init Services.
    const collectionService = new CollectionService(queryExecutor, cacheBuilder);
    const userService = new UserService(queryExecutor, cacheBuilder);
    const ghEventService = new GHEventService(queryExecutor);

    logger.info("Loading collections...");
    const { data: collections } = await collectionService.getCollections();

    logger.info(`Found ${collections.length} collections, start calc collection's repos ranking.`)
    for (const { id: collectionId, name } of collections) {
        const query = new Query(COLLECTIONS_RANKING_QUERY, cacheBuilder, queryExecutor, ghEventService, collectionService, userService)
        const { data: collection_items } = await query.run({
            collectionId: collectionId
        }, false, null, undefined, true);
        
        if (Array.isArray(collection_items)) {
            logger.info(`Found ${collection_items.length} repos in the collection <${name}> ...`);
            for (const item of collection_items) {
                const sql = `
                    UPDATE
                        collection_items
                    SET
                        last_month_rank = ${item.current_month_rank},
                        last_2nd_month_rank =  ${item.last_month_rank}
                    WHERE
                        collection_id = ${collectionId}
                        AND repo_id = '${item.repo_id}'
                `;
                conn.execute(sql);
            }
            logger.info(`Updated the month rank for collection <${name}>.`)
        }

        await sleep(interval * 1000);
    }
});
