import * as dotenv from "dotenv";
import * as path from 'path'
import {TiDBQueryExecutor} from "../../app/core/TiDBQueryExecutor";
import consola from "consola";
import Query from "../../app/core/Query";
import CacheBuilder from "../../app/core/cache/CacheBuilder";
import CollectionService from "../../app/services/CollectionService";
import GHEventService from "../../app/services/GHEventService";
import UserService from "../../app/services/UserService";
import schedule from 'node-schedule';
import sleep from "../../app/utils/sleep";
import { getConnectionOptions, handleDisconnect } from "../../app/utils/db";
import { createConnection } from "mysql2";

const COLLECTIONS_RANKING_QUERY = 'collection-stars-month-rank';

// Init logger.
const logger = consola.withTag('calc-hot-collections');

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const cron = process.env.CALC_HOT_COLLECTIONS_CRON;
if (cron === undefined || cron === '') {
    logger.error('Please provide the `CALC_HOT_COLLECTIONS_CRON` environment variable.');
    process.exit(-1);
}

const interval = parseInt(process.env.CALC_HOT_COLLECTIONS_INTERVAL || '30');

// Notice: node-schedule does not support concurrency control, 
// so it is best not to set the interval of cron expressions too close.
logger.info(`Execute calc hot collections job according cron expression: ${cron}`);
schedule.scheduleJob(cron, async () => {
    // Init TiDB client.
    const conn = createConnection(getConnectionOptions());
    handleDisconnect(conn);

    // Init TiDB Query Executor.
    const queryExecutor = new TiDBQueryExecutor(getConnectionOptions({
        connectionLimit: 1
    }));

    // Init Cache Builder; 
    const enableCache = process.env.ENABLE_CACHE === '1' ? true : false;
    const cacheBuilder = new CacheBuilder(enableCache);

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
        }, true, null, undefined, true);
        
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
                conn.execute(sql);
            }
            logger.info(`Updated the month rank for collection <${name}>.`)
        }

        await sleep(interval * 1000);
    }
});
