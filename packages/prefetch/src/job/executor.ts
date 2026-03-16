import {QueryRunner} from "@ossinsight/api-server";
import {DateTime} from "luxon";
import pino from "pino";
import {prefetchQueryCounter, prefetchQueryHistogram} from "../metrics";
import {PrefetchJob} from "./generator";

export class JobExecutor {

  constructor(
    private readonly logger: pino.Logger,
    private readonly queryRunner: QueryRunner
  ) {}

  async execute(job: PrefetchJob, timeout: number) {
    const {queryName, params, refreshQueue} = job;
    prefetchQueryCounter.inc({query: queryName, phase: 'process'});
    this.logger.info(params, `🚀 Prefetching query <%s> in queue <%s>.`, queryName, refreshQueue);

    // Execute the query.
    const qStart = DateTime.utc();
    const histogram = await prefetchQueryHistogram.labels({query: queryName, queue: refreshQueue});
    try {
      const {spent} = await this.queryRunner.query<any>(queryName, params, {
        refreshCache: true,
        ignoreOnlyFromCache: true,
        queryOptions: {
          timeout: timeout,
        }
      });
      const qEnd = DateTime.utc();
      const costTime = qEnd.diff(qStart, ['seconds']);
      histogram.observe(costTime.seconds);

      prefetchQueryCounter.inc({query: queryName, phase: 'success'});
      this.logger.info({
        params,
        spent
      }, "✅  Finish prefetch <%s>, start at: %s, end at: %s, cost: %d s.", queryName, qStart, qEnd, costTime.seconds);
      if (costTime.seconds > 180) {
        this.logger.warn(params, "⚠️ Prefetch query <%s> cost too much time: %d s", queryName, costTime.seconds);
      }
    } catch (err) {
      const qEnd = DateTime.utc();
      const costTime = qEnd.diff(qStart, ['seconds']);
      histogram.observe(costTime.seconds);

      prefetchQueryCounter.inc({query: queryName, phase: 'error'});
      this.logger.error({
        params,
        err
      }, '❌ Failed to prefetch query <%s>, start at: %s, end at: %s, cost: %d s.', queryName, qStart, qEnd, costTime.seconds);
    }
  }

}