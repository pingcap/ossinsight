import async, { QueueObject } from "async";
import consola, { Consola } from "consola";
import CacheBuilder from "../../app/core/cache/CacheBuilder";
import Query from "../../app/core/Query";
import { TiDBQueryExecutor } from "../../app/core/TiDBQueryExecutor";
import CollectionService from "../../app/services/CollectionService";
import GHEventService from "../../app/services/GHEventService";
import UserService from "../../app/services/UserService";

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
export const QUEUE_DEFS = [
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
    private logger: Consola;
    private queueMap: Map<string, QueueObject<QueryJob>>;

    constructor(
        private readonly queryExecutor: TiDBQueryExecutor,
        private readonly cacheBuilder: CacheBuilder,
        private readonly ghEventService: GHEventService,
        private readonly collectionService: CollectionService,
        private readonly userService: UserService,
    ) {
        this.logger = consola.withTag('job-scheduler');
        this.queueMap = new Map();
        for(const { name, concurrent } of QUEUE_DEFS) {
            this.queueMap.set(name, async.queue(async (job) => {
                const { queryName, params, refreshQueue: queueName } = job;
                // Do query with the rest parameter combines.
                this.logger.info("PreFetch query <%s> in queue <%s> with params: %s", queryName, queueName, JSON.stringify(params));
              
                const qStart = new Date();
                const query = new Query(queryName, this.cacheBuilder, this.queryExecutor, this.ghEventService, this.collectionService, this.userService)
                try {
                  await query.execute(params, true)
                } catch (err) {
                  this.logger.error('Failed to prefetch query %s with params: %s', queryName, JSON.stringify(params), err)
                  this.logger.error('Failed raw url: %s', (err as any)?.rawSql?.replace(/\n/g, ' '))
                }
                const qEnd = new Date();
              
                // Output the statistics info.
                const qCostTime = (qEnd.getTime() - qStart.getTime()) / 1000;
                this.logger.success(
                    "Finish prefetch <%s>, queue: <%s>, start at: %s, end at: %s, cost: %d s", 
                    queryName, queueName, qStart, qEnd, qCostTime
                );
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

