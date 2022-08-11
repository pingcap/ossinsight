import consola, { Consola } from "consola";
import { Connection } from "mysql2";

// The batch insert size.
const DEFAULT_BATCH_SIZE = 100;

// The flush interval which control how often do it perform a batch insert 
// if the batch quantity is not reached.
// Default: 10 second.
const DEFAULT_FLUSH_INTERVAL = 10;

export class BatchLoader {
    private conn: Connection;
    private buf: any[];
    private logger: Consola;
    private timer: NodeJS.Timer;

    constructor(
        conn: Connection,
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

    flush() {
        return new Promise((resolve, reject) => {
            if (this.buf.length > 0) {
                this.conn.query(this.sql, [this.buf], (err, res) => {
                    this.buf = [];

                    if (err !== null) {
                        this.logger.error(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            }
            resolve(null);
        });
    }
}
