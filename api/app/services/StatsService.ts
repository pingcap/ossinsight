import consola from "consola";
import { BatchLoader } from "../core/BatchLoader";
import CacheBuilder from "../core/cache/CacheBuilder";
import { TiDBQueryExecutor } from "../core/TiDBQueryExecutor";
import { ConnectionWrapper, getConnectionOptions } from "../utils/db";

const logger = consola.withTag('stats-service');
const STATS_QUERY_PREFIX = 'stats-'

export default class StatsService {
    private queryStatsLoader: BatchLoader;

    constructor(
      readonly executor: TiDBQueryExecutor,
      public readonly cacheBuilder: CacheBuilder,
    ) {
        const conn = new ConnectionWrapper(getConnectionOptions());
        this.queryStatsLoader = new BatchLoader(conn, `
            INSERT INTO stats_query_summary(query_name, digest_text, executed_at) VALUES ?
        `, 1);
    }

    async addQueryStatsRecord(queryName: string, digestText: string, executedAt: Date) {
        try {
            // Skip stats query.
            if (queryName === undefined || queryName.includes(STATS_QUERY_PREFIX)) {
                return;
            }
            digestText = digestText.replaceAll(/\s+/g, ' ');
            this.queryStatsLoader.insert([queryName, digestText, executedAt]);
        } catch(err) {
            logger.error(`Failed to add query stats record for ${queryName}.`);
        }
    }

}