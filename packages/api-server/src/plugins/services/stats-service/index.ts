import { BatchLoader } from "../../../core/db/batch-loader";
import {Pool} from "mysql2/promise";
import fp from "fastify-plugin";
import pino from "pino";

declare module 'fastify' {
  interface FastifyInstance {
    statsService: StatsService;
  }
}

export default fp(async (app) => {
    app.decorate('statsService', new StatsService(
      app.mysql as unknown as Pool,
      app.log as pino.Logger,
    ));
    app.addHook('onClose', async (app) => {
      await app.statsService.destroy();
    })
}, {
  name: '@ossinsight/stats-service',
  dependencies: [
    '@fastify/env',
    '@ossinsight/tidb'
  ]
});

const STATS_QUERY_PREFIX = 'stats-';
const INSERT_STATS_BATCH_SIZE = 2;

export class StatsService {
  private readonly logger: pino.Logger;
    private queryStatsLoader: BatchLoader;

  constructor(
    readonly pool: Pool,
    pLogger: pino.Logger,
  ) {
    this.logger = pLogger.child({ module: 'stats-service' });
    this.queryStatsLoader = new BatchLoader(this.logger, this.pool, `INSERT INTO stats_query_summary(query_name, digest_text, executed_at) VALUES ?`, {
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
            await this.queryStatsLoader.insert([queryName, digestText, executedAt]);
        } catch(err) {
            this.logger.error(`Failed to add query stats record for ${queryName}.`);
        }
    }

    async flush () {
      await this.queryStatsLoader.flush();
    }

    async destroy () {
      await this.queryStatsLoader.destroy();
    }
}