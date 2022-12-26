import {
    Connection,
    ConnectionOptions,
    FieldPacket,
    OkPacket,
    Pool,
    QueryOptions,
    ResultSetHeader,
    RowDataPacket
} from "mysql2/promise";
import {getConnectionOptions, getPool} from "./new";
import pino from "pino";

const logger = pino().child({ component: 'connection-wrapper' });

export class ConnectionWrapper implements Omit<Connection, '[INITIALIZED]'> {

    threadId: number;
    readonly config: ConnectionOptions;

    private _conn: Connection | undefined;
    private pool: Pool;
    private _destroyed: boolean = false;
    private readonly initPromise: () => Promise<void>;
    private constructor(extendOptions: ConnectionOptions) {
        this.config = getConnectionOptions(extendOptions);
        this.threadId = 0;
        this.pool = getPool({
            ...this.config,
            waitForConnections: true,
            enableKeepAlive: true,
            connectionLimit: 2,
        });
        this.initPromise = this.init;
        this.initPromise().catch((err) => {
            console.log(err)
        });
    }

    get conn(): Connection {
        if (this._conn === undefined) {
            throw new Error("Connection is not initialized");
        }
        return this._conn;
    }

    set conn(value: Connection) {
        this._conn = value;
    }

    static async new(extendOptions: ConnectionOptions) {
        const wrapper = new ConnectionWrapper(extendOptions);
        await wrapper.initPromise();
        return wrapper;
    }

    async init() {
        this.conn = await this.pool.getConnection();
        this.threadId = this.conn.threadId;

        const errorHandler = async (err: any) => {
            if (!err.fatal) return;
            if (err.code !== 'PROTOCOL_CONNECTION_LOST') throw err;

            if (this._destroyed) {
                return;
            }

            logger.warn(`Database server connection lost, trying to reconnect.`);

            // Try to reconnect.
            for (let i = 0; i < 3; i++) {
                try {
                    const newConn = await this.pool.getConnection();
                    await newConn.connect();
                    newConn.on('error', errorHandler);
                    this.conn = newConn;
                    break;
                } catch (e) {
                    const delay = Math.pow(2, i) * 1000;
                    logger.error(`Failed to reconnect to database server, retrying in %d seconds.`, delay / 1000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        this.conn.on('error', errorHandler);
    }

    async connect(): Promise<void> {
        return this.conn.connect();
    }

    async ping(): Promise<void> {
        await this.initPromise();
        return this.conn.ping();
    }

    async beginTransaction(): Promise<void> {
        return this.conn.beginTransaction();
    }

    async commit(): Promise<void> {
        return this.conn.commit();
    }

    async rollback(): Promise<void> {
        await this.conn.rollback();
    }

    async changeUser(options: ConnectionOptions): Promise<void> {
        return await this.conn.changeUser(options);
    }

    pause(): void {
        this.conn.pause();
    }

    resume(): void {
        this.conn.resume();
    }

    async destroy(): Promise<void> {
        this._destroyed = true;
        this.conn.destroy();
        await this.pool.end();
    }

    async end(options?: any): Promise<void> {
        return this.conn.end(options);
    }

    escape(value: any): string {
        return this.conn.escape(value);
    }

    escapeId(value: string): string;
    escapeId(value: string[]): string;
    escapeId(value: any): string {
        return this.conn.escapeId(value);
    }

    format(sql: string, values?: any | any[] | { [param: string]: any }): string {
        return this.conn.format(sql, values);
    }

    unprepare(sql: string): void {
        this.conn.unprepare(sql);
    }

    query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        sql: string
    ): Promise<[T, FieldPacket[]]>;
    query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        sql: string,
        values: any | any[] | { [param: string]: any }
    ): Promise<[T, FieldPacket[]]>;
    query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        options: QueryOptions
    ): Promise<[T, FieldPacket[]]>;
   query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        options: QueryOptions,
        values: any | any[] | { [param: string]: any }
    ): Promise<[T, FieldPacket[]]>;
    async query<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        options: any,
        values?: any | any[] | { [param: string]: any }
    ): Promise<[T, FieldPacket[]]> {
        return await this.conn.query(options, values);
    }

    execute<
        T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader
        >(
        sql: string
    ): Promise<[T, FieldPacket[]]>;
    execute<
        T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader
        >(
        sql: string,
        values: any | any[] | { [param: string]: any }
    ): Promise<[T, FieldPacket[]]>;
    execute<
        T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader
        >(
        options: QueryOptions
    ): Promise<[T, FieldPacket[]]>;
    execute<
        T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader
        >(
        options: QueryOptions,
        values: any | any[] | { [param: string]: any }
    ): Promise<[T, FieldPacket[]]>;
    execute<T extends RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader>(
        options: any,
        values?: any | any[] | { [param: string]: any }
    ): Promise<[T, FieldPacket[]]> {
        return this.conn.execute(options, values);
    }

    on(event: string, listener: (...args: any[]) => void): this {
        this.conn.on(event, listener);
        return this;
    }

    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.conn.off(eventName, listener);
        return this;
    }

    once(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.conn.once(eventName, listener);
        return this;
    }

    emit(eventName: string | symbol, ...args: any[]): boolean {
        return this.conn.emit(eventName, ...args);
    }

    eventNames(): (string | symbol)[] {
        return this.conn.eventNames();
    }

    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.conn.addListener(eventName, listener);
        return this;
    }

    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.conn.removeListener(eventName, listener);
        return this;
    }

    removeAllListeners(event?: string | symbol | undefined): this {
        this.conn.removeAllListeners(event);
        return this;
    }

    setMaxListeners(n: number): this {
        this.conn.setMaxListeners(n);
        return this;
    }

    getMaxListeners(): number {
        return this.conn.getMaxListeners();
    }

    listeners(eventName: string | symbol): Function[] {
        return this.conn.listeners(eventName);
    }

    rawListeners(eventName: string | symbol): Function[] {
        return this.conn.rawListeners(eventName);
    }

    listenerCount(eventName: string | symbol): number {
        return this.conn.listenerCount(eventName);
    }

    prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.conn.prependListener(eventName, listener);
        return this;
    }

    prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.conn.prependOnceListener(eventName, listener);
        return this;
    }

}