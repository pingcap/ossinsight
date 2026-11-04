import {FastifyPluginAsync} from "fastify";
import Redis from "ioredis";
// import {DateTime} from "luxon";
import pino from "pino";
import {cachedHealth} from '../../utils/http/cached-health';
import {checkTiDBIfConnected} from "../../utils/db";
import Logger = pino.Logger;

// interface EventsTotalQueryResult {
//   cnt: number;
//   latest_created_at: string;
//   latest_timestamp: string;
// }

const healthResponseSchema = {
  type: 'object',
  description: 'Service health',
  properties: {
    healthy: {
      type: 'boolean',
    },
    isTiDBHealthy: {
      type: 'boolean',
    },
    isRedisHealthy: {
      type: 'boolean',
    },
    isShadowTiDBHealthy: {
      type: 'boolean',
    },
    // prefetchLatency: {
    //   type: 'number',
    // },
  }
};

const schema = {
  description: 'Check if the API server is healthy.',
  tags: ['system'],
  response: {200: healthResponseSchema, 500: healthResponseSchema},
};

const root: FastifyPluginAsync = async (app, opts): Promise<void> => {
  const check = cachedHealth(async () => {
    let healthy = true;
    const healthInfo: Record<string, any> = {};

    // ping TiDB and Redis
    const [isTiDBHealthy, isRedisHealthy, isShadowTiDBHealthy] = await Promise.all([
      checkTiDBIfConnected(app.log as Logger, app.mysql),
      checkIfRedisHealthy(app.redis),
      checkTiDBIfConnected(app.log as Logger, app.mysql.shadow)
    ]);

    // Check if the latency of prefetch.
    // const totalRes = await app.queryRunner.query<EventsTotalQueryResult[]>('events-total', {});
    // const latestEventAt = totalRes?.data?.[0]?.latest_created_at;
    // if (!latestEventAt) {
    //   app.log.error(`📋 Check the latency of prefetch, failed to get the last event at from events-total query.`);
    //   healthy = false;
    // } else {
    //   const latency = DateTime.utc().diff(DateTime.fromISO(latestEventAt), 'minutes').minutes - 5;
    //   healthInfo.prefetchLatency = latency;
    //   if (latency > 20) {
    //     app.log.error(`📋 Check the latency of prefetch, found it more than 20 minutes (latency = ${latency} minutes).`);
    //     healthy = false;
    //   }
    // }

    // Check if TiDB is healthy.
    if (isTiDBHealthy !== null) {
      healthInfo.isTiDBHealthy = isTiDBHealthy;
      if (!isTiDBHealthy) {
        healthy = false;
      }
    }

    // Check if Redis is healthy.
    if (isRedisHealthy !== null) {
      healthInfo.isRedisHealthy = isRedisHealthy;
      if (!isRedisHealthy) {
        healthy = false;
      }
    }

    // Check if Shadow TiDB is healthy, but it's not required.
    if (isShadowTiDBHealthy !== null) {
      healthInfo.isShadowTiDBHealthy = isShadowTiDBHealthy;
    }

    return { ...healthInfo, healthy };
  });
  app.get('/', {schema}, async function (_req, reply) {
    const healthInfo = await check();
    return reply.header('Cache-Control', 'no-store').status(healthInfo.healthy ? 200 : 500).send(healthInfo);
  });
}

async function checkIfRedisHealthy (redis?: Redis): Promise<boolean | null> {
  if (!redis) {
    return null;
  }

  try {
    await redis.ping();
    return true;
  } catch (e) {
    console.error('Failed to connect Redis.');
    return false;
  }
}

export default root;