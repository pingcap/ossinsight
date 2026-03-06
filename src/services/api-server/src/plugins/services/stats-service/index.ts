import {FastifyBaseLogger} from "fastify";
import fp from "fastify-plugin";
import {Pool} from "mysql2/promise";
import {Logger} from "pino";
import {BatchLoader} from "../../../core/db/batch-loader";

declare module 'fastify' {
  interface FastifyInstance {
    statsService: StatsService;
  }
}

export default fp(async (app) => {
  app.decorate('statsService', new StatsService(
    app.mysql as unknown as Pool,
    app.log,
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
  private readonly logger: FastifyBaseLogger
  private queryStatsLoader: BatchLoader;

  constructor(
    readonly pool: Pool,
    readonly pLogger: FastifyBaseLogger,
  ) {
    this.logger = pLogger.child({module: 'stats-service'});
    const insertSQL = `INSERT INTO stats_query_summary(query_name, digest_text, executed_at) VALUES ?;`
    this.queryStatsLoader = new BatchLoader(this.logger as Logger, this.pool, insertSQL, {
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
    } catch (err) {
      this.logger.error(`Failed to add query stats record for ${queryName}.`);
    }
  }

  async flush() {
    await this.queryStatsLoader.flush();
  }

  async destroy() {
    await this.queryStatsLoader.destroy();
  }
}