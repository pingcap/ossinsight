import async, {QueueObject} from "async";
import pino from "pino";
import {prefetchQueryCounter, queueWaitsGauge} from "../metrics";
import {JobExecutor} from "./executor";
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
        timeout: 240_000
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
        timeout: 180_000
    }
]

export class JobScheduler {
    private queueMap: Map<string, QueueObject<PrefetchJob>>;

    constructor(
        private readonly logger: pino.Logger,
        readonly jobExecutor: JobExecutor,
    ) {
        this.queueMap = new Map();
        for(const { name, concurrent, timeout } of QueueRegister) {
            this.queueMap.set(name, async.queue(async (job) => await jobExecutor.execute(job, timeout), concurrent));
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
