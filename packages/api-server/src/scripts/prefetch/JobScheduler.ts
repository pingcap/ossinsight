import async, {QueueObject} from "async";
import pino from "pino";
import {QueryRunner} from "../../core/runner/query/QueryRunner";
import {DateTime} from "luxon";

export interface QueryJob {
    queryName: string;
    refreshQueue: string;
    refreshCron: string;
    params: {
        [key:string]: string;
    }
}

export interface PrefetchQueue {
    name: string;
    concurrent: number;
}

export const DEFAULT_QUEUE_NAME = 'MAIN';
export const QUEUE_DEFS: PrefetchQueue[] = [
    {
        name: "MAIN",
        concurrent: 1,
    },
    {
        name: "CONCURRENT",
        concurrent: 3,
    },
    {
        name: "REALTIME",
        concurrent: 1,
    },
    {
        name: "EVENTS_TOTAL",
        concurrent: 1,
    }
]

export class JobScheduler {
    private queueMap: Map<string, QueueObject<QueryJob>>;

    constructor(
        private readonly logger: pino.Logger,
        private readonly queryRunner: QueryRunner,
    ) {
        this.queueMap = new Map();
        for(const { name, concurrent } of QUEUE_DEFS) {
            this.queueMap.set(name, async.queue(async (job) => {
                const { queryName , params, refreshQueue } = job;
                this.logger.info(params, `🚀 Prefetching query <%s> in queue <%s>.`, queryName, refreshQueue);

                // Execute the query.
                const qStart = DateTime.utc();
                try {
                    await this.queryRunner.query(queryName, params, {
                        refreshCache: true,
                        ignoreCache: true,
                        ignoreOnlyFromCache: true,
                    });
                } catch (err) {
                    const sql = (err as any)?.rawSql?.replace(/\n/g, ' ');
                    this.logger.error({ sql },'❌ Failed to prefetch query <%s>.', queryName)
                }
                const qEnd = DateTime.utc();
              
                // Output the statistics info.
                const costTime = qEnd.diff(qStart, ['seconds']);
                const costTimeStr = costTime.toHuman();
                this.logger.info("✅ Finish prefetch <%s>, start at: %s, end at: %s, cost: %s", queryName, qStart, qEnd, costTimeStr);
                if (costTime.seconds > 180) {
                    this.logger.warn("Prefetch query <%s> cost too much time: %s", queryName, costTimeStr);
                }
            }, concurrent));
        }
    }

    async scheduleJob(job: QueryJob):Promise<boolean> {
        let { queryName, refreshQueue } = job;
        const queue = this.queueMap.get(refreshQueue);
        if (!queue) {
            return false;
        }

        this.logger.info(`🚶‍Pushing query <%s> into queue <%s> (wait: %d).`, queryName, refreshQueue, queue.length());
        queue.push(job, (error: any)=> {
            if (error) {
                this.logger.error(error, 'Failed to execute job for query <%s> in queue <%s>.', queryName, refreshQueue);
            }
        });

        return true;
    }

}

