import { BatchLoader } from "../../core/db/BatchLoader";
import { createPool } from "mysql2/promise";
import fp from "fastify-plugin";
import { getConnectionOptions } from "../../utils/db";
import pino from "pino";

declare module 'fastify' {
  interface FastifyInstance {
    statsService: StatsService;
  }
}

export default fp(async (fastify) => {
    const log = fastify.log.child({ service: 'stats-service'}) as pino.Logger;
    fastify.decorate('statsService', new StatsService(log));
}, {
  name: 'stats-service',
  dependencies: [
    '@fastify/env',
  ]
});

const STATS_QUERY_PREFIX = 'stats-';
const INSERT_STATS_BATCH_SIZE = 2;

export class StatsService {
    private queryStatsLoader: BatchLoader;

    constructor(
        private readonly log: pino.Logger
    ) {
        const pool = createPool(getConnectionOptions({
            connectionLimit: 2
        }));
        this.queryStatsLoader = new BatchLoader(pool, `
            INSERT INTO stats_query_summary(query_name, digest_text, executed_at) VALUES ?
        `, {
            batchSize: INSERT_STATS_BATCH_SIZE
        });
    }

    async addQueryStatsRecord(queryName: string, digestText: string, executedAt: Date, refresh?: boolean) {
        try {
            // Skip stats queries and queries whose result read from cache.
            if (queryName === undefined || queryName.includes(STATS_QUERY_PREFIX) || refresh != true) {
                return;
            }
            digestText = digestText.replaceAll(/\s+/g, ' ');
            this.queryStatsLoader.insert([queryName, digestText, executedAt]);
        } catch(err) {
            this.log.error(`Failed to add query stats record for ${queryName}.`);
        }
    }

    destroy () {
      this.queryStatsLoader.destroy();
    }
}