import { Pool, ResultSetHeader } from "mysql2/promise";

import pino from "pino";

export const DEFAULT_BATCH_SIZE = 100;
export const DEFAULT_FLUSH_INTERVAL = 10;
export const DEFAULT_MAX_RETRIES = 2;

export interface Option {
    /**
     * The maxRetries determine how many times the insert statement will be executed
     * when it failed.
     * 
     * Default: 2
     */
    maxRetries?: number;
    /**
     * The flushInterval is used to control how often do it perform a batch insert
     * if the batch size is not reached. If it is less than 0, will not flush intermittently.
     * 
     * Default: 10 second.
     */
    flushInterval?: number;
    /**
     * The batchSize is used to control how many records will be insert once.
     * 
     * Default: 100
     */
    batchSize?: number;
}

export class BatchLoader {
    private buf: any[];
    private logger = this.pLogger.child({ 'module': 'batch-loader' });
    private readonly batchSize: number;
    private readonly maxRetries: number;
    private readonly intervalHandle: ReturnType<typeof setInterval> | undefined
    private _lastFlushJob: Promise<void> | undefined;
    private readonly pendingFlushes = new Set<Promise<void>>();

    constructor(
        readonly pLogger: pino.Logger = pino(),
        readonly pool: Pool,
        readonly sql: string,
        readonly option: Option = {}
    ) {
        this.buf = [];

        this.maxRetries = option.maxRetries || DEFAULT_MAX_RETRIES;
        if (this.maxRetries < 0) {
            this.maxRetries = 0;
        }

        this.batchSize = option.batchSize || DEFAULT_BATCH_SIZE;
        if (this.batchSize < 0) {
            throw new Error('Batch size must greater than 0.');
        }

        const flushInterval = option.flushInterval || DEFAULT_FLUSH_INTERVAL;
        if (flushInterval > 0) {
            this.intervalHandle = setInterval(async () => {
                if (this.buf.length > 0) {
                    this.logger.debug(`Batch loader flush after ${flushInterval} seconds interval.`);
                    this._lastFlushJob = this.flush();
                }
            }, flushInterval * 1000);
        }
    }

    async insert(values: any[]) {
        this.buf.push(values);

        if (this.buf.length >= this.batchSize) {
            await this.flush();
        }
    }

    /**
     * Whether the buffer used for batch inserting is empty.
     */
    get empty (): boolean {
        return this.buf.length > 0;
    }

    async flush(): Promise<void> {
        if (!this.empty) {
            return;
        }

        // Notice: During batch insertion phase as follows, data may still be written to buffer.
        // If we clean up the buffer array after the batch insertion is completed, that will result in data loss.
        // So we can copy it to a temporary memory and clear the buffer so that it can continue to store new data.
        const records = [...this.buf];
        this.buf = [];
        const job = this.insertBatch(records);
        this.pendingFlushes.add(job);
        try {await job;} finally {this.pendingFlushes.delete(job);}
    }

    private async insertBatch(records: any[][]): Promise<void> {
        for (let retries = 0; retries <= this.maxRetries; retries++) {
            try {                
                await this.pool.query<ResultSetHeader>(this.sql, [records]);
                return;
            } catch (err) {
                const errno = typeof (err as any)?.errno === 'number' ? (err as any).errno : undefined;
                // These are deterministic row-validation failures: the failed
                // INSERT committed no rows. Do not split connection/timeout
                // failures, whose commit outcome may be unknown.
                if ([1048, 1264, 1265, 1292, 1366, 1406, 3140].includes(errno)) {
                    if (records.length > 1) {
                        const middle = Math.floor(records.length / 2);
                        await this.insertBatch(records.slice(0, middle));
                        await this.insertBatch(records.slice(middle));
                    } else {
                        this.logger.error({event: 'batch_row_rejected', errno, records: 1}, 'Invalid row isolated from the batch.');
                    }
                    return;
                }
                const num = records.length;
                // Driver errors can contain SQL and every buffered record.
                // Log only bounded metadata, never the error object/message.
                if (retries < this.maxRetries) {
                    this.logger.error({errno, records: num, retry: retries + 1}, 'Batch insert failed; retrying.');
                } else {
                    this.logger.error({event: 'batch_insert_failed', errno, records: num}, 'Batch insert exhausted its retry budget.');
                    break;
                }
            }
        }
    }

    async destroy () {
        clearInterval(this.intervalHandle);
        await this._lastFlushJob;
        await this.flush();
        await Promise.all(this.pendingFlushes);
    }
}
