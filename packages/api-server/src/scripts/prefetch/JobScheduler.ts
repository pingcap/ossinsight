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
                const { queryName = DEFAULT_QUEUE_NAME, params, refreshQueue: queueName } = job;
                const logger = this.logger.child({ queueName, queryName, params });
                logger.info("Prefetching query <%s> in queue <%s>.", queryName, queueName);

                // Execute the query.
                const qStart = DateTime.utc();
                try {
                    await this.queryRunner.query(queryName, params, {
                        refreshCache: true,
                    });
                } catch (err) {
                    const sql = (err as any)?.rawSql?.replace(/\n/g, ' ');
                    logger.error({ sql },'Failed to prefetch query %s.', queryName)
                }
                const qEnd = DateTime.utc();
              
                // Output the statistics info.
                const qCostTime = qEnd.diff(qStart, ['seconds']).toHuman();
                this.logger.info("Finish prefetch <%s>, start at: %s, end at: %s, cost: %s", queryName, qStart, qEnd, qCostTime);
            }, concurrent));
        }
    }

    async scheduleJob(job: QueryJob):Promise<boolean> {
        let { queryName, refreshQueue } = job;
        const queue = this.queueMap.get(refreshQueue);
        if (queue === undefined) {
            this.logger.error(`Failed to schedule job for query <${queryName}>, because can not found the queue named: ${refreshQueue}`);
            return false;
        }

        await queue?.pushAsync(job);
        return true;
    }

}

