import fp from "fastify-plugin";
import fastifyMetrics from 'fastify-metrics';
import {Counter, Histogram, Summary} from "prom-client";

export const metricsPrefix = 'ossinsight_api_';

export default fp(async (app) => {
    await app.register(fastifyMetrics, {
        endpoint: '/metrics',
        name: process.env.NODE_APP_INSTANCE!,
    });
}, {
    name: 'metrics',
    dependencies: [
        '@fastify/env'
    ],
});

export const tidbQueryCounter = new Counter({
    name: metricsPrefix + 'tidb_query_count',
    help: 'TiDB query count',
    labelNames: ['query', 'phase'] as const,
})

export const cacheHitCounter = new Counter({
    name: metricsPrefix + 'cache_hit_count',
    help: 'Cache hit count'
})

export const ghQueryCounter = new Counter({
    name: metricsPrefix + 'gh_api_query_count',
    help: 'GitHub api query count',
    labelNames: ['api', 'phase'] as const
})

export const waitTidbConnectionTimer = new Summary({
    name: metricsPrefix + 'wait_tidb_connection_time',
    help: 'Wait tidb connection time',
    percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
})

export const dataQueryTimer = new Summary({
    name: metricsPrefix + 'data_query_time',
    help: 'Data query time',
    percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
})

export const tidbQueryTimer = new Summary({
    name: metricsPrefix + 'tidb_query_time',
    help: 'TiDB query time',
    percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
})

export const ghQueryTimer = new Summary({
    name: metricsPrefix + 'gh_api_query_time',
    help: 'GitHub api query timer',
    labelNames: ['api'],
    percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
})

export const cacheQueryTimer = new Summary({
    name: metricsPrefix + 'cache_query_time',
    help: 'Cache query time',
    labelNames: ['op'] as const,
    percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
})

export const readConfigTimer = new Summary({
    name: metricsPrefix + 'read_config_time',
    help: 'Read config timer',
    labelNames: ['type'],
    percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
})

export async function measure<T>(metrics: Summary<any> | Summary.Internal<any> | Histogram<any> | Histogram.Internal<any>, fn: () => Promise<T>) {
    const end = metrics.startTimer()
    try {
        return await fn()
    } finally {
        end()
    }
}

