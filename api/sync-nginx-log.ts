import consola from 'consola';
import * as dotenv from "dotenv";
import { DateTime } from 'luxon';
import { Connection, createConnection } from 'mysql2';
import path from 'path';
import { Tail } from 'tail';
import { URL } from 'url';
import { validateProcessEnv } from './app/env';

// The batch insert size.
const DEFAULT_BATCH_SIZE = 100;

// The flush interval which control how often do it perform a batch insert 
// if the batch quantity is not reached.
// Default: 10 second.
const DEFAULT_FLUSH_INTERVAL = 10;

// The default access log format of nginx.
// Reference: http://nginx.org/en/docs/http/ngx_http_log_module.html
// log_format combined '$remote_addr - $remote_user [$time_local] '
//                     '"$request" $status $body_bytes_sent '
//                     '"$http_referer" "$http_user_agent"';
// Regexp test: https://regex101.com/r/SXSJkC/1
const ACCESS_LOG_PATTERN = /(?<remote_addr>((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)*)\s*-\s*(?<remote_user>.+)\s*-\s*\[(?<time_local>.+)\]\s*"(?<request_method>(GET|POST|PUT|DELETE))\s(?<request_url>.+)\s(?<request_protocol>\S+)\"\s(?<status_code>\d+)\s(?<bytes>\d+)\s\"(?<host>.+)\"\s\"(?<refer>.+)"/g;

// Do not count the access records of the following paths, 
// because these requests may be frequent.
const IGNORE_PATH = new Set([
    '/q/events-total',
    '/q/events-increment',
    '/q/events-increment-list',
    '/q/events-increment-intervals',
]);

// Load environments.
dotenv.config({ path: __dirname+'/.env.template' });
dotenv.config({ path: __dirname+'/.env', override: true });

validateProcessEnv();

// Init logger.
const logger = consola.withTag('nginx-log-sync');

interface AccessLog {
    id?: string;
    remoteAddr: string;
    statusCode: string;
    requestPath: string;
    requestParams: string;      // Store as JSON column.
    requestedAt: Date;
}

class BatchLoader {
    private conn: Connection;
    private buf: any[];
    private timer: NodeJS.Timer;

    constructor(
        conn: Connection,
        readonly sql: string,
        readonly batchSize: number = DEFAULT_BATCH_SIZE,
        readonly flushInterval: number = DEFAULT_FLUSH_INTERVAL
    ) {
        this.conn = conn;
        this.buf = [];
        this.timer = setInterval(async () => {
            if (this.buf.length !== 0) {
                logger.debug(`Loader flush after ${flushInterval} seconds interval.`);
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
                        logger.error(err);
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

async function main () {
    // Check if nginx access log existed.
    const logFilepath = process.env.NGINX_ACCESS_LOG;
    if (logFilepath === undefined) {
        logger.error('please provide nginx access log filepath.');
        return;
    }

    // Init TiDB client.
    const conn = createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '4000'),
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        queueLimit: 10,
        decimalNumbers: true,
        timezone: 'Z'
    });

    // Start read access log as stream.
    const sql = 'INSERT IGNORE INTO access_logs(remote_addr, status_code, request_path, request_params, requested_at) VALUES ?';
    const loader = new BatchLoader(conn, sql);
    const tail = new Tail(logFilepath);
    tail.on("line", function(line: string) {
        try {
            const log = extractAccessLog(line);
            if (log !== null && !IGNORE_PATH.has(log.requestPath)) {
                logger.debug(log);
                loader.insert([log.remoteAddr, log.statusCode, log.requestPath, log.requestParams, log.requestedAt]);
            }
        } catch(err) {
            logger.error(`Failed to process log line: ${line}`, err);
        }
    });
    
    tail.on("error", function(err: any) {
        logger.info('ERROR: ', err);
    });
}

function extractAccessLog(str: string) {
    const matches = ACCESS_LOG_PATTERN.exec(str);

    if (Array.isArray(matches) && matches.groups !== undefined) {
        const groups = matches.groups;
        // Local time format: https://en.wikipedia.org/wiki/Common_Log_Format
        // luxon date format token: https://moment.github.io/luxon/#/parsing?id=table-of-tokens
        const requestedAt = DateTime.fromFormat(groups['time_local'], 'dd/MMM/yyyy:HH:mm:ss ZZZ').toJSDate();
        const url = new URL(path.join(groups['host'],  groups['request_url']));
        const accessLog:AccessLog = {
            remoteAddr: groups['remote_addr'],
            statusCode: groups['status_code'],
            requestPath: url.pathname,
            requestParams: JSON.stringify(urlSearchParamsObject(url.searchParams)),
            requestedAt: requestedAt,
        };
        return accessLog
    }
    
    return null;
}

function urlSearchParamsObject(searchParams: URLSearchParams) {
    const res:any = {};
    const params = searchParams.entries();
    if (searchParams !== null) {
        for (const [key, value] of params) {
            res[key] = value;
        }
    }
    return res;
}

main();
