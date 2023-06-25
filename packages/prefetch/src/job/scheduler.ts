import async, {QueueObject} from "async";
import pino from "pino";
import {QueryRunner} from "@ossinsight/api-server";
import {DateTime} from "luxon";
import {prefetchQueryCounter, prefetchQueryHistogram, queueWaitsGauge} from "../metrics";
import {PrefetchJob} from "./generator";

export interface PrefetchQueue {
    name: string;
    // The concurrent of the queue.
    concurrent: number;
    // Timeout in milliseconds.
    timeout: number;
}

export const DEFAULT_QUEUE_NAME = 'MAIN';

export const QueueRegister: PrefetchQueue[] = [
    {
        name: "MAIN",
        concurrent: 2,
        timeout: 180_000
    },
    {
        name: "CONCURRENT",
        concurrent: 3,
        timeout: 60_000
    },
    {
        name: "REALTIME",
        concurrent: 2,
        timeout: 10_000
    },
    {
        name: "EVENTS_TOTAL",
        concurrent: 2,
        timeout: 45_000
    }
]

export class JobScheduler {
    private queueMap: Map<string, QueueObject<PrefetchJob>>;

    constructor(
        private readonly logger: pino.Logger,
        private readonly queryRunner: QueryRunner,
    ) {
        this.queueMap = new Map();
        for(const { name, concurrent, timeout } of QueueRegister) {
            this.queueMap.set(name, async.queue(async (job) => {
                const { queryName , params, refreshQueue } = job;
                prefetchQueryCounter.inc({ query: queryName, phase: 'process' });
                this.logger.info(params, `🚀 Prefetching query <%s> in queue <%s>.`, queryName, refreshQueue);

                // Execute the query.
                const qStart = DateTime.utc();

                const histogram = await prefetchQueryHistogram.labels({ query: queryName, queue: refreshQueue });
                try {
                    const { spent } = await this.queryRunner.query<any>(queryName, params, {
                        refreshCache: true,
                        ignoreCache: true,
                        ignoreOnlyFromCache: true,
                        queryOptions: {
                            timeout: timeout,
                        }
                    });
                    const qEnd = DateTime.utc();
                    const costTime = qEnd.diff(qStart, ['seconds']);
                    histogram.observe(costTime.seconds);

                    prefetchQueryCounter.inc({ query: queryName, phase: 'success' });
                    this.logger.info({ params, spent }, "✅ Finish prefetch <%s>, start at: %s, end at: %s, cost: %d s.", queryName, qStart, qEnd, costTime.seconds);
                    if (costTime.seconds > 180) {
                        this.logger.warn(params, "⚠️ Prefetch query <%s> cost too much time: %d s", queryName, costTime.seconds);
                    }
                } catch (err) {
                    const qEnd = DateTime.utc();
                    const costTime = qEnd.diff(qStart, ['seconds']);
                    histogram.observe(costTime.seconds);

                    prefetchQueryCounter.inc({ query: queryName, phase: 'fail' });
                    this.logger.error({ params, err },'❌ Failed to prefetch query <%s>, start at: %s, end at: %s, cost: %d s.', qStart, qEnd, queryName, costTime.seconds);
                }
            }, concurrent));
        }
    }

    async scheduleJob(job: PrefetchJob):Promise<boolean> {
        let { queryName, refreshQueue } = job;
        const queue = this.queueMap.get(refreshQueue);
        if (!queue) {
            return false;
        }

        this.logger.info({ job }, `🚶‍ Pushing query <%s> into queue <%s> (wait: %d).`, queryName, refreshQueue, queue.length());
        queueWaitsGauge.set({ queue: refreshQueue }, queue.length());
        prefetchQueryCounter.inc({ query: queryName, phase: 'queued' });

        queue.push(job, (error: any)=> {
            if (error) {
                this.logger.error(error, '❌ Failed to execute job for query <%s> in queue <%s>.', queryName, refreshQueue);
            }
            queueWaitsGauge.set({ queue: refreshQueue }, queue.length());
        });

        return true;
    }

}
