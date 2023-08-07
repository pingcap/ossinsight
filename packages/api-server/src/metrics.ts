import {AxiosResponse} from "axios";
import {Counter, exponentialBuckets, Histogram, Summary} from "prom-client";

export const metricsPrefix = 'ossinsight_api_';

// The metrics related to TiDB.
export const tidbWaitConnectionHistogram = new Histogram({
  name: metricsPrefix + 'tidb_wait_conn_duration_seconds',
  help: 'The duration of waiting tidb connection.',
  buckets: exponentialBuckets(0.0005, 2, 20),  // 0.5 ms ~ 4.36 minutes
});

export const tidbQueryCounter = new Counter({
  name: metricsPrefix + 'tidb_query_total',
  help: 'The total number of TiDB query.',
  labelNames: ['query', 'phase'] as const,
});

export const tidbQueryHistogram = new Histogram({
  name: metricsPrefix + 'tidb_query_duration_seconds',
  help: 'The query duration (in seconds) of TiDB query.',
  labelNames: ['query'] as const,
  buckets: exponentialBuckets(0.0005, 2, 23),  // 0.5 ms ~ 1.16 hours
});

// The metrics related to shadow TiDB.

export const shadowTidbWaitConnectionHistogram = new Histogram({
  name: metricsPrefix + 'shadow_tidb_wait_conn_duration_seconds',
  help: 'The duration of waiting shadow tidb connection.',
  buckets: exponentialBuckets(0.0005, 2, 20),  // 0.5 ms ~ 4.36 minutes
});

export const shadowTidbQueryCounter = new Counter({
  name: metricsPrefix + 'shadow_tidb_query_total',
  help: 'The total number of TiDB query from shadow traffic.',
  labelNames: ['query', 'phase'] as const,
});

export const shadowTidbQueryHistogram = new Histogram({
  name: metricsPrefix + 'shadow_tidb_query_duration_seconds',
  help: 'The query duration (in seconds) of shadow TiDB query.',
  labelNames: ['query'] as const,
  buckets: exponentialBuckets(0.0005, 2, 23),  // 0.5 ms ~ 1.16 hours
});

// The metrics related to TiDB Cloud Data Service.
export const dataServiceRequestCounter = new Counter({
  name: metricsPrefix + 'data_service_request_total',
  help: 'The total number of requests to data service.',
  labelNames: ['api', 'statusCode'] as const,
});

export const dataServiceRequestTimer = new Summary({
  name: metricsPrefix + 'data_service_req_summary_seconds',
  help: 'The duration of request data service endpoint.',
  labelNames: ['api'] as const,
  percentiles: [0.999, 0.99, 0.95, 0.80, 0.50, 0.10],
});

// The metrics related to cache.

export const cacheHitCounter = new Counter({
  name: metricsPrefix + 'cache_hit_total',
  help: 'The total number of cache hitting.'
});

export const cacheQueryHistogram = new Histogram({
  name: metricsPrefix + 'cache_query_duration_seconds',
  help: 'The query duration (in seconds) of cache query.',
  labelNames: ['op'] as const,
  buckets: exponentialBuckets(0.0005, 2, 22),  // 0.5 ms ~ 34 minutes
});

// The metrics related to preset query.

export const presetQueryCounter = new Counter({
  name: metricsPrefix + 'preset_query_total',
  help: 'The total number of data querying.'
});

export const presetQueryTimer = new Summary({
  name: metricsPrefix + 'preset_query_summary_seconds',
  help: 'The summary of the duration of data querying.',
  percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
});

export const readConfigTimer = new Summary({
  name: metricsPrefix + 'read_config_summary_seconds',
  help: 'The summary of the duration of reading query config file.',
  labelNames: ['type'],
  percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
});

// The metrics related to GitHub API.

export const githubAPITimer = new Summary({
  name: metricsPrefix + 'gh_api_req_summary_seconds',
  help: 'The summary of the duration of GitHub API requesting.',
  labelNames: ['api'],
  percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
});

export const githubAPICounter = new Counter({
  name: metricsPrefix + 'gh_api_req_total',
  help: 'The total number of GitHub API requesting.',
  labelNames: ['api', 'statusCode'] as const
});

// The metrics related to OpenAI API.

export const openaiAPITimer = new Summary({
  name: metricsPrefix + 'openai_api_req_summary_seconds',
  help: 'The summary of the duration of OpenAI API requesting.',
  labelNames: ['api'],
  percentiles: [0.999, 0.99, 0.95, 0.80, 0.50],
});

export const openaiAPICounter = new Counter({
  name: metricsPrefix + 'openai_api_req_total',
  help: 'The total number to OpenAI API requesting.',
  labelNames: ['api', 'statusCode'] as const
});

export async function measure<T>(metrics: Summary<any> | Summary.Internal<any> | Histogram<any> | Histogram.Internal<any>, fn: () => Promise<T>) {
  const end = metrics.startTimer()
  try {
    return await fn()
  } finally {
    end()
  }
}

export async function measureAPIRequest<T>(metrics: Summary<any> | Summary.Internal<any> | Histogram<any> | Histogram.Internal<any>, api: string, fn: () => Promise<T>) {
  const end = metrics.startTimer({ api })
  try {
    return await fn()
  } finally {
    end()
  }
}

export async function countAPIRequest<T extends AxiosResponse<any, any>>(counter: Counter, api: string, fn: () => Promise<T>) {
  try {
    const res = await fn();
    counter.inc({ api, statusCode: res.status});
    return res;
  } catch (err: any) {
    counter.inc({ api, statusCode: err?.response?.status || 500 });
    throw err;
  }
}

