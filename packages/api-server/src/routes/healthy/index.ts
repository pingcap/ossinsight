import {FastifyPluginAsync} from "fastify";
import Redis from "ioredis";
import {DateTime} from "luxon";
import pino from "pino";
import {checkTiDBIfConnected} from "../../utils/db";
import Logger = pino.Logger;

const schema = {
  description: 'Check if the API server is healthy.',
  tags: ['system'],
  response: {
    200: {
      type: 'object',
      description: 'OK',
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
        prefetchLatency: {
          type: 'number',
        }
      }
    }
  }
};

const root: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get('/', {
    schema
  }, async function (req, reply) {
    let healthy = true;
    const healthInfo: Record<string, any> = {};

    // ping TiDB and Redis
    const [isTiDBHealthy, isRedisHealthy, isShadowTiDBHealthy] = await Promise.all([
      checkTiDBIfConnected(app.log as Logger, app.mysql),
      checkIfRedisHealthy(app.redis),
      checkTiDBIfConnected(app.log as Logger, app.mysql.shadow)
    ]);

    // Check if the latency of prefetch.
    const res = await app.queryRunner.query<any>('events-total', {});
    if (!Array.isArray(res?.data) || !res?.data[0]?.latest_created_at) {
      app.log.error(`📋 Check the latency of prefetch, failed to get the last requestedAt of events-total query.`);
      healthy = false;
    } else {
      const latency = DateTime.utc().diff(DateTime.fromISO(res?.data[0]?.latest_created_at), 'minutes').minutes - 5;
      healthInfo.prefetchLatency = latency;
      if (latency > 20) {
        app.log.error(`📋 Check the latency of prefetch, found it more than 20 minutes (latency = ${latency} minutes).`);
        healthy = false;
      } else if (latency > 10) {
        app.log.warn(`📋 Check the latency of prefetch, found it more than 10 minutes (latency = ${latency} minutes).`);
      }
    }

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

    healthInfo.healthy = healthy;
    if (healthy) {
      reply.status(200).send(healthInfo);
    } else {
      reply.status(500).send(healthInfo);
    }
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
