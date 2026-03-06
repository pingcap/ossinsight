import {
  cacheHitCounter,
  cacheQueryHistogram,
  shadowTidbQueryCounter, shadowTidbQueryHistogram,
  shadowTidbWaitConnectionHistogram,
  tidbQueryCounter,
  tidbQueryHistogram,
  tidbWaitConnectionHistogram
} from "@ossinsight/api-server";
import {collectDefaultMetrics, Registry} from "prom-client";

// Init metrics server.
export const register = new Registry();

register.registerMetric(tidbWaitConnectionHistogram);
register.registerMetric(tidbQueryHistogram);
register.registerMetric(tidbQueryCounter);
register.registerMetric(shadowTidbWaitConnectionHistogram);
register.registerMetric(shadowTidbQueryHistogram);
register.registerMetric(shadowTidbQueryCounter);
register.registerMetric(cacheQueryHistogram);
register.registerMetric(cacheHitCounter);

collectDefaultMetrics({
  register,
  labels: {
    NODE_APP_INSTANCE: process.env.NODE_APP_INSTANCE || 'ossinsight-job-server'
  }
});