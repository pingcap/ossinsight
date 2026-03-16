import {Counter, exponentialBuckets, Gauge, Histogram} from "prom-client";

export const metricsPrefix = 'ossinsight_prefetch_';

export const queueWaitsGauge = new Gauge({
  name: `${metricsPrefix}queue_waits`,
  help: 'The number of jobs waiting in the prefetch queue.',
  labelNames: ['queue'] as const,
});

export const prefetchQueryCounter = new Counter({
  name: `${metricsPrefix}query_total`,
  help: 'The total number of prefetch queries.',
  labelNames: ['query', 'phase'] as const,
});

export const prefetchQueryHistogram = new Histogram({
  name: `${metricsPrefix}query_duration_seconds`,
  help: 'The duration of query prefetching.',
  labelNames: ['query', 'queue'] as const,
  buckets: exponentialBuckets(0.0005, 2, 23),  // 0.5ms ~ 1.16 hours
});