import consola from "consola";
import { Pool, createPool } from "mysql2/promise";
import { BatchLoader } from "../core/BatchLoader";
import CacheBuilder from "../core/cache/CacheBuilder";
import { TiDBQueryExecutor } from "../core/TiDBQueryExecutor";
import { getConnectionOptions, getShadowConnectionOptions } from "../utils/db";

const logger = consola.withTag('stats-service');
const STATS_QUERY_PREFIX = 'stats-';
const INSERT_STATS_BATCH_SIZE = 2;

function createQueryStatsLoader(pool: Pool): BatchLoader {
    return new BatchLoader(pool, `
            INSERT INTO stats_query_summary(query_name, digest_text, executed_at) VALUES ?
        `, {
        batchSize: INSERT_STATS_BATCH_SIZE
    });
}

export default class StatsService {
    private queryStatsLoader: BatchLoader;
    private shadowQueryStatsLoader?: BatchLoader;

    constructor(
      readonly executor: TiDBQueryExecutor,
      public readonly cacheBuilder: CacheBuilder,
    ) {
        const pool = createPool(getConnectionOptions({
            connectionLimit: 2
        }));
        this.queryStatsLoader = createQueryStatsLoader(pool);
        let shadowOptions = getShadowConnectionOptions({
            connectionLimit: 2
        });
        if (shadowOptions != null) {
            this.shadowQueryStatsLoader = createQueryStatsLoader(createPool(shadowOptions));
        }
    }

    async addQueryStatsRecord(queryName: string, digestText: string, executedAt: Date, refresh: boolean) {
        try {
            // Skip stats queries and queries whose result read from cache.
            if (queryName === undefined || queryName.includes(STATS_QUERY_PREFIX) || refresh != true) {
                return;
            }
            digestText = digestText.replaceAll(/\s+/g, ' ');
            this.queryStatsLoader.insert([queryName, digestText, executedAt]);
            this.shadowQueryStatsLoader?.insert([queryName, digestText, executedAt]);
        } catch(err) {
            logger.error(`Failed to add query stats record for ${queryName}.`);
        }
    }
}