import { BatchLoader } from "../../../core/db/batch-loader";
import {Pool} from "mysql2/promise";
import fp from "fastify-plugin";
import {getPool} from "../../../core/db/new";
import pino from "pino";

declare module 'fastify' {
  interface FastifyInstance {
    statsService: StatsService;
  }
}

export default fp(async (fastify) => {
    const log = fastify.log.child({ service: 'stats-service'}) as pino.Logger;
    const pool = await getPool({
        uri: fastify.config.DATABASE_URL,
    });
    const shadowPool = !!fastify.config.SHADOW_DATABASE_URL ? await getPool({
        uri: fastify.config.SHADOW_DATABASE_URL,
    }) : null;
    fastify.decorate('statsService', new StatsService(pool, log, shadowPool));
    fastify.addHook('onClose', async (app) => {
      await fastify.statsService.destroy()
    })
}, {
  name: 'stats-service',
  dependencies: [
    '@fastify/env',
  ]
});

const STATS_QUERY_PREFIX = 'stats-';
const INSERT_STATS_BATCH_SIZE = 2;

function newStatsLoader(pool: Pool): BatchLoader {
  return new BatchLoader(pool, `INSERT INTO stats_query_summary(query_name, digest_text, executed_at) VALUES ?`, {
    batchSize: INSERT_STATS_BATCH_SIZE
  });
}

export class StatsService {
    private queryStatsLoader: BatchLoader;
    private shadowQueryStatsLoader: BatchLoader | null;

    constructor(
        readonly pool: Pool,
        private readonly log: pino.Logger,
        readonly shadowPool: Pool | null,
    ) {
        this.queryStatsLoader = newStatsLoader(this.pool);
        this.shadowQueryStatsLoader = this.shadowPool != null ? newStatsLoader(this.shadowPool) : null;
    }

    async addQueryStatsRecord(queryName: string, digestText: string, executedAt: Date, refresh?: boolean) {
        try {
            // Skip stats queries and queries whose result read from cache.
            if (queryName === undefined || queryName.includes(STATS_QUERY_PREFIX) || refresh != true) {
                return;
            }
            digestText = digestText.replaceAll(/\s+/g, ' ');
            await this.queryStatsLoader.insert([queryName, digestText, executedAt]);
            await this.shadowQueryStatsLoader?.insert([queryName, digestText, executedAt]);
        } catch(err) {
            this.log.error(`Failed to add query stats record for ${queryName}.`);
        }
    }

    async flush () {
      await this.queryStatsLoader.flush();
    }

    async destroy () {
      await this.queryStatsLoader.destroy();
      await this.pool.end();
    }
}