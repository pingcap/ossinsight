import {collectDefaultMetrics, Counter, Histogram, Summary} from 'prom-client'

export const metricsPrefix = 'ossinsight_api_';

collectDefaultMetrics({
  prefix: metricsPrefix,
  labels: process.env.NODE_APP_INSTANCE ? {
    NODE_APP_INSTANCE: process.env.NODE_APP_INSTANCE
  } : undefined,
})

export const requestCounter = new Counter({
  name: metricsPrefix + 'request_count',
  help: 'Request count',
  labelNames: ['url', 'phase', 'status'] as const,
})

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

export const requestProcessTimer = new Summary({
  name: metricsPrefix + 'request_process_time',
  help: 'Request process time',
  labelNames: ['url'] as const
})

export const waitTidbConnectionTimer = new Summary({
  name: metricsPrefix + 'wait_tidb_connection_time',
  help: 'Wait tidb connection time',
})

export const dataQueryTimer = new Summary({
  name: metricsPrefix + 'data_query_time',
  help: 'Data query time',
})

export const tidbQueryTimer = new Summary({
  name: metricsPrefix + 'tidb_query_time',
  help: 'TiDB query time',
})

export const ghQueryTimer = new Summary({
  name: metricsPrefix + 'gh_api_query_time',
  help: 'GitHub api query timer',
  labelNames: ['api']
})

export const redisQueryTimer = new Summary({
  name: metricsPrefix + 'redis_query_time',
  help: 'Redis query time',
  labelNames: ['op'] as const
})

export const limitedRequestCounter = new Counter({
  name: metricsPrefix + 'limited_http_request_count',
  help: 'Limited HTTP request count',
})

export async function measure<T>(metrics: Summary<any> | Summary.Internal<any> | Histogram<any> | Histogram.Internal<any>, fn: () => Promise<T>) {
  const end = metrics.startTimer()
  try {
    return await fn()
  } finally {
    end()
  }
}
