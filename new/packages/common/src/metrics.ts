import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

export const metricsRegistry = new Registry();

// Collect default Node.js metrics
collectDefaultMetrics({ register: metricsRegistry });

/** Create a counter metric */
export function createCounter(name: string, help: string, labels: string[] = []): Counter {
  const counter = new Counter({ name, help, labelNames: labels, registers: [metricsRegistry] });
  return counter;
}

/** Create a histogram metric */
export function createHistogram(
  name: string,
  help: string,
  labels: string[] = [],
  buckets?: number[],
): Histogram {
  const histogram = new Histogram({
    name,
    help,
    labelNames: labels,
    buckets: buckets || [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30, 60, 120],
    registers: [metricsRegistry],
  });
  return histogram;
}

/** Create a gauge metric */
export function createGauge(name: string, help: string, labels: string[] = []): Gauge {
  const gauge = new Gauge({ name, help, labelNames: labels, registers: [metricsRegistry] });
  return gauge;
}

/** Get metrics output in Prometheus format */
export async function getMetrics(): Promise<string> {
  return metricsRegistry.metrics();
}

/** Get metrics content type */
export function getMetricsContentType(): string {
  return metricsRegistry.contentType;
}
