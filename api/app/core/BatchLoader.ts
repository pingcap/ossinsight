import consola, { Consola } from "consola";
import { ConnectionWrapper } from "../utils/db";

// The batch insert size.
const DEFAULT_BATCH_SIZE = 100;

// The flush interval which control how often do it perform a batch insert 
// if the batch quantity is not reached.
// Default: 10 second.
const DEFAULT_FLUSH_INTERVAL = 10;

export class BatchLoader {
    private conn: ConnectionWrapper;
    private buf: any[];
    private logger: Consola;
    private timer: NodeJS.Timer;

    constructor(
        conn: ConnectionWrapper,
        readonly sql: string,
        readonly batchSize: number = DEFAULT_BATCH_SIZE,
        readonly flushInterval: number = DEFAULT_FLUSH_INTERVAL
    ) {
        this.conn = conn;
        this.buf = [];
        this.logger = consola.withTag('batch-loader');
        this.timer = setInterval(async () => {
            if (this.buf.length !== 0) {
                this.logger.debug(`Loader flush after ${flushInterval} seconds interval.`);
                await this.flush();
            }
        }, flushInterval * 1000);
    }

    async insert(values: any[]) {
        this.buf.push(values);

        if (this.buf.length >= this.batchSize) {
            await this.flush();
        }
    }

    flush(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.buf.length > 0) {
               try {
                    await this.conn.query(this.sql, [this.buf]);
                    this.buf = [];
               } catch (err) {
                    reject(err);
               }
            }
            resolve();
        });
    }
}
