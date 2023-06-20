import {Counter, Gauge, Summary} from "prom-client";

export const metricsPrefix = 'ossinsight_prefetch_';

export const queueWaitsGauge = new Gauge({
  name: `${metricsPrefix}queue_waits`,
  help: 'The number of jobs waiting in the prefetch queue.',
  labelNames: ['queue'] as const,
});

export const prefetchQueryCounter = new Counter({
  name: `${metricsPrefix}prefetch_query_count`,
  help: 'The number of prefetch queries.',
  labelNames: ['query', 'phase'] as const,
});

export const prefetchQueryTimer = new Summary({
  name: `${metricsPrefix}prefetch_query_time`,
  help: 'The latency of prefetching a query.',
  labelNames: ['query', 'queue'] as const
});