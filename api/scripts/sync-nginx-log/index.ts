import consola from 'consola';
import * as dotenv from "dotenv";
import { DateTime } from 'luxon';
import { createPool } from 'mysql2/promise';
import path from 'path';
import { Tail } from 'tail';
import { URL } from 'url';
import { BatchLoader } from '../../app/core/BatchLoader';
import { getConnectionOptions } from '../../app/utils/db';

// The default access log format of nginx.
// Reference: http://nginx.org/en/docs/http/ngx_http_log_module.html
// log_format combined '$remote_addr - $remote_user [$time_local] '
//                     '"$request" $status $body_bytes_sent '
//                     '"$http_referer" "$http_user_agent"';
// Regexp test: https://regex101.com/r/SXSJkC/1
const ACCESS_LOG_PATTERN = /(?<remote_addr>((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)*)\s*-\s*(?<remote_user>.+)\s*-\s*\[(?<time_local>.+)\]\s*"(?<request_method>(GET|POST|PUT|DELETE))\s(?<request_path>.+)\s(?<request_protocol>\S+)\"\s(?<status_code>\d+)\s(?<bytes>\d+)\s\"(?<host>.+)\"\s\"(?<refer>.+)"/g;

// Do not count the access records of the following paths, 
// because these requests may be frequent.
const IGNORE_PATH = new Set([
    '/q/events-total',
    '/q/events-increment',
    '/q/events-increment-list',
    '/q/events-increment-intervals',
]);

const ONLY_HOST = 'https://ossinsight.io/'

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

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

async function main () {
    // Check if nginx access log existed.
    const logFilepath = process.env.NGINX_ACCESS_LOG;
    if (logFilepath === undefined) {
        logger.error('please provide nginx access log filepath.');
        return;
    }

    // Init TiDB client.
    const pool = createPool(getConnectionOptions({
        connectionLimit: 2
    }));

    // Start read access log as stream.
    const sql = 'INSERT IGNORE INTO access_logs(remote_addr, status_code, request_path, request_params, requested_at) VALUES ?';
    const loader = new BatchLoader(pool, sql);
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
        const host = groups['host'];
        if (host != ONLY_HOST) {
            return null;
        }
        const url = new URL(path.join(host,  groups['request_path']));
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
