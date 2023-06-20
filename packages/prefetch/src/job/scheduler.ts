import async, {QueueObject} from "async";
import pino from "pino";
import {QueryRunner} from "@ossinsight/api-server";
import {DateTime} from "luxon";
import {prefetchQueryCounter, prefetchQueryTimer, queueWaitsGauge} from "../metrics";
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
        concurrent: 1,
        timeout: 180_000
    },
    {
        name: "CONCURRENT",
        concurrent: 3,
        timeout: 60_000
    },
    {
        name: "REALTIME",
        concurrent: 1,
        timeout: 10_000
    },
    {
        name: "EVENTS_TOTAL",
        concurrent: 1,
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
                const end = await prefetchQueryTimer.startTimer({ query: queryName, queue: refreshQueue });
                try {
                    await this.queryRunner.query(queryName, params, {
                        refreshCache: true,
                        ignoreCache: true,
                        ignoreOnlyFromCache: true,
                        queryOptions: {
                            timeout: timeout,
                        }
                    });
                    const qEnd = DateTime.utc();
                    const costTime = qEnd.diff(qStart, ['seconds']);
                    const costTimeStr = costTime.toHuman();

                    prefetchQueryCounter.inc({ query: queryName, phase: 'success' });
                    this.logger.info(params, "✅  Finish prefetch <%s>, start at: %s, end at: %s, cost: %s", queryName, qStart, qEnd, costTimeStr);
                    if (costTime.seconds > 180) {
                        this.logger.warn(params, "⚠️ Prefetch query <%s> cost too much time: %s", queryName, costTimeStr);
                    }
                } catch (err) {
                    const qEnd = DateTime.utc();
                    const costTime = qEnd.diff(qStart, ['seconds']);
                    const costTimeStr = costTime.toHuman();
                    const sql = (err as any)?.rawSql?.replace(/\n/g, ' ');

                    prefetchQueryCounter.inc({ query: queryName, phase: 'fail' });
                    this.logger.error({ params, sql, err },'❌ Failed to prefetch query <%s> (cost: %s).', queryName, costTimeStr);
                } finally {
                    end();
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

        this.logger.info({ job }, `🚶‍Pushing query <%s> into queue <%s> (wait: %d).`, queryName, refreshQueue, queue.length());
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
