/**
 * GHArchive ETL Tasks
 *
 * Migrates Ruby ETL (etl/lib/importer.rb, etl/lib/tasks/import.rake)
 * to TypeScript/Orbital for gharchive_dev data import.
 */
import { logger } from '../logger.js';
import { createPool } from 'mysql2/promise';
import { createGunzip } from 'zlib';
import https from 'https';
// ============================================================================
// Configuration
// ============================================================================
const GHARCHIVE_BASE_URL = 'http://data.gharchive.org';
const CACHE_DIR = process.env.GHARCHIVE_CACHE_DIR || '/tmp/gharchive';
const BATCH_SIZE = 90000; // Match Ruby's 90000 batch size
const MAX_RETRIES = 5;
const DOWNLOAD_TIMEOUT = 600000; // 10 minutes (match Ruby's 600s)
// ============================================================================
// Database Connection
// ============================================================================
let dbPool = null;
function getDbPool() {
    if (!dbPool) {
        const dbUrl = process.env.BACKGROUND_DATABASE_URL ||
            process.env.DATABASE_URL ||
            'mysql://localhost:3306/ossinsight';
        // Parse MySQL connection URL
        const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/([^?]+)(?:\?(.*))?/);
        if (!match) {
            throw new Error(`Invalid database URL: ${dbUrl}`);
        }
        const [, user, password, host, port, database, params] = match;
        dbPool = createPool({
            host,
            port: parseInt(port, 10),
            user,
            password,
            database,
            connectionLimit: 20,
            queueLimit: 0,
            enableKeepAlive: true,
        });
    }
    return dbPool;
}
// ============================================================================
// Import Log Management
// ============================================================================
async function createImportLog(data) {
    const pool = getDbPool();
    const sql = `
    INSERT INTO import_logs (filename, start_batch_at, status)
    VALUES (?, ?, ?)
  `;
    const [result] = await pool.execute(sql, [
        data.filename,
        data.start_batch_at,
        data.status || 'pending'
    ]);
    return result.insertId;
}
async function updateImportLog(id, updates) {
    const pool = getDbPool();
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    const sql = `UPDATE import_logs SET ${fields} WHERE id = ?`;
    await pool.execute(sql, [...values, id]);
}
// ============================================================================
// GHArchive Importer
// ============================================================================
export class GharchiveImporter {
    filename;
    url;
    batchAt;
    importLogId;
    events = [];
    cacheDir;
    upsert;
    constructor(filename, options = {}) {
        this.filename = filename;
        this.url = `${GHARCHIVE_BASE_URL}/${filename}`;
        this.cacheDir = options.cacheDir || CACHE_DIR;
        this.batchAt = new Date();
        this.upsert = options.upsert ?? false;
    }
    async run() {
        try {
            // Create import log
            this.importLogId = await createImportLog({
                filename: this.filename,
                start_batch_at: this.batchAt.toISOString(),
                status: 'pending'
            });
            // Download
            await this.updateLog({ status: 'downloading', start_download_at: new Date().toISOString() });
            const jsonStream = await this.download();
            await this.updateLog({ end_download_at: new Date().toISOString() });
            if (!jsonStream) {
                logger.warn({ filename: this.filename }, 'Skipping 404 file');
                await this.updateLog({ status: 'completed' });
                return;
            }
            // Parse
            await this.updateLog({ status: 'parsing' });
            logger.info({ filename: this.filename }, 'Starting to parse JSON data');
            await this.parse(jsonStream);
            logger.info({ filename: this.filename, count: this.events.length }, 'Parsing completed');
            // Import
            await this.updateLog({ status: 'importing', start_import_at: new Date().toISOString() });
            await this.import();
            await this.updateLog({ end_import_at: new Date().toISOString(), status: 'completed' });
            logger.info({ filename: this.filename, count: this.events.length }, 'Import completed');
        }
        catch (error) {
            logger.error({ filename: this.filename, error }, 'Import failed');
            await this.updateLog({
                status: 'failed',
                error_message: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
    async updateLog(updates) {
        await updateImportLog(this.importLogId, updates);
    }
    async download() {
        logger.info({ url: this.url }, 'Starting download');
        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                return await new Promise((resolve, reject) => {
                    const request = https.get(this.url, {
                        timeout: DOWNLOAD_TIMEOUT
                    }, (response) => {
                        if (response.statusCode === 404) {
                            logger.warn({ url: this.url }, 'File not found (404)');
                            resolve(null);
                            return;
                        }
                        if (response.statusCode !== 200) {
                            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                            return;
                        }
                        logger.info({ url: this.url }, 'Download successful');
                        resolve(response);
                    });
                    request.on('error', (error) => {
                        reject(error);
                    });
                    request.on('timeout', () => {
                        request.destroy();
                        reject(new Error('Download timeout'));
                    });
                    request.setTimeout(DOWNLOAD_TIMEOUT);
                });
            }
            catch (error) {
                retries++;
                const isRetryable = error instanceof Error &&
                    (error.message.includes('timeout') ||
                        error.message.includes('ETIMEDOUT') ||
                        error.message.includes('ECONNRESET') ||
                        error.message.includes('socket hang up'));
                if (!isRetryable || retries >= MAX_RETRIES) {
                    throw error;
                }
                const delay = Math.pow(2, retries) * 1000; // Exponential backoff
                logger.warn({
                    url: this.url,
                    retry: retries,
                    delay,
                    error: error instanceof Error ? error.message : String(error)
                }, 'Retrying download');
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return null;
    }
    async parse(stream) {
        const gunzip = createGunzip();
        const decompressed = stream.pipe(gunzip);
        let buffer = '';
        for await (const chunk of decompressed) {
            buffer += chunk.toString('utf8');
            // Process complete JSON objects (newline-delimited JSON)
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            for (const line of lines) {
                if (!line.trim())
                    continue;
                try {
                    const event = JSON.parse(line);
                    this.events.push(this.extractFields(event));
                }
                catch (error) {
                    logger.warn({ error, line: line.substring(0, 100) }, 'Failed to parse JSON line');
                }
            }
            // Batch insert if we have enough events
            if (this.events.length >= BATCH_SIZE) {
                await this.flushEvents();
            }
        }
        // Process remaining buffer
        if (buffer.trim()) {
            try {
                const event = JSON.parse(buffer);
                this.events.push(this.extractFields(event));
            }
            catch (error) {
                logger.warn({ error }, 'Failed to parse final JSON line');
            }
        }
        // Flush remaining events
        if (this.events.length > 0) {
            await this.flushEvents();
        }
    }
    extractFields(event) {
        const dateMatch = event.created_at?.match(/((\d{4})-\d{2})-\d{2}/);
        const eventDay = dateMatch ? dateMatch[0] : '1970-01-01';
        const eventMonth = dateMatch ? `${dateMatch[1]}-01` : '1970-01-01';
        const eventYear = dateMatch ? parseInt(dateMatch[2], 10) : 1970;
        return {
            id: event.id || '',
            type: event.type || 'Event',
            actor_id: event.actor?.id || 0,
            actor_login: event.actor?.login || '',
            repo_id: event.repo?.id || 0,
            repo_name: event.repo?.name || '',
            org_id: event.org?.id || 0,
            org_login: event.org?.login || '',
            created_at: event.created_at || '1970-01-01 00:00:00',
            language: event.payload?.pull_request?.base?.repo?.language || '',
            additions: event.payload?.pull_request?.additions || 0,
            deletions: event.payload?.pull_request?.deletions || 0,
            action: event.payload?.action || '',
            number: event.payload?.issue?.number ||
                event.payload?.pull_request?.number ||
                event.payload?.number || 0,
            commit_id: event.payload?.comment?.commit_id || '',
            comment_id: event.payload?.comment?.id || 0,
            state: event.payload?.pull_request?.state ||
                event.payload?.issue?.state || '',
            closed_at: event.payload?.pull_request?.closed_at ||
                event.payload?.issue?.closed_at || '1970-01-01 00:00:00',
            comments: event.payload?.pull_request?.comments ||
                event.payload?.issue?.comments || 0,
            pr_merged: event.payload?.pull_request?.merged || false,
            pr_merged_at: event.payload?.pull_request?.merged_at || '1970-01-01 00:00:00',
            pr_changed_files: event.payload?.pull_request?.changed_files || 0,
            pr_review_comments: event.payload?.pull_request?.review_comments || 0,
            pr_or_issue_id: event.payload?.pull_request?.id ||
                event.payload?.issue?.id || 0,
            push_size: event.payload?.size || 0,
            push_distinct_size: event.payload?.distinct_size || 0,
            creator_user_id: event.payload?.comment?.user?.id ||
                event.payload?.review?.user?.id ||
                event.payload?.issue?.user?.id ||
                event.payload?.pull_request?.user?.id || 0,
            creator_user_login: event.payload?.comment?.user?.login ||
                event.payload?.review?.user?.login ||
                event.payload?.issue?.user?.login ||
                event.payload?.pull_request?.user?.login || '',
            pr_or_issue_created_at: event.payload?.issue?.created_at ||
                event.payload?.pull_request?.created_at ||
                '1970-01-01 00:00:00',
            event_day: eventDay,
            event_month: eventMonth,
            event_year: eventYear
        };
    }
    async flushEvents() {
        if (this.events.length === 0)
            return;
        logger.info({ count: this.events.length }, 'Flushing events to database');
        if (this.upsert) {
            await this.upsertAll();
        }
        else {
            await this.insertAll();
        }
        this.events = [];
    }
    async insertAll() {
        const pool = getDbPool();
        const sql = `
      INSERT INTO github_events (
        id, type, actor_id, actor_login, repo_id, repo_name, org_id, org_login,
        created_at, language, additions, deletions, action, number, commit_id,
        comment_id, state, closed_at, comments, pr_merged, pr_merged_at,
        pr_changed_files, pr_review_comments, pr_or_issue_id, push_size,
        push_distinct_size, creator_user_id, creator_user_login,
        pr_or_issue_created_at, event_day, event_month, event_year
      ) VALUES ?
    `;
        const values = this.events.map(e => [
            e.id, e.type, e.actor_id, e.actor_login, e.repo_id, e.repo_name,
            e.org_id, e.org_login, e.created_at, e.language, e.additions, e.deletions,
            e.action, e.number, e.commit_id, e.comment_id, e.state, e.closed_at,
            e.comments, e.pr_merged, e.pr_merged_at, e.pr_changed_files,
            e.pr_review_comments, e.pr_or_issue_id, e.push_size, e.push_distinct_size,
            e.creator_user_id, e.creator_user_login, e.pr_or_issue_created_at,
            e.event_day, e.event_month, e.event_year
        ]);
        await pool.execute(sql, [values]);
        logger.info({ count: this.events.length }, 'Batch insert completed');
    }
    async upsertAll() {
        const pool = getDbPool();
        const sql = `
      INSERT INTO github_events (
        id, type, actor_id, actor_login, repo_id, repo_name, org_id, org_login,
        created_at, language, additions, deletions, action, number, commit_id,
        comment_id, state, closed_at, comments, pr_merged, pr_merged_at,
        pr_changed_files, pr_review_comments, pr_or_issue_id, push_size,
        push_distinct_size, creator_user_id, creator_user_login,
        pr_or_issue_created_at, event_day, event_month, event_year
      ) VALUES ?
      ON DUPLICATE KEY UPDATE
        type = VALUES(type),
        actor_login = VALUES(actor_login),
        repo_name = VALUES(repo_name),
        org_login = VALUES(org_login),
        language = VALUES(language),
        additions = VALUES(additions),
        deletions = VALUES(deletions)
    `;
        const values = this.events.map(e => [
            e.id, e.type, e.actor_id, e.actor_login, e.repo_id, e.repo_name,
            e.org_id, e.org_login, e.created_at, e.language, e.additions, e.deletions,
            e.action, e.number, e.commit_id, e.comment_id, e.state, e.closed_at,
            e.comments, e.pr_merged, e.pr_merged_at, e.pr_changed_files,
            e.pr_review_comments, e.pr_or_issue_id, e.push_size, e.push_distinct_size,
            e.creator_user_id, e.creator_user_login, e.pr_or_issue_created_at,
            e.event_day, e.event_month, e.event_year
        ]);
        await pool.execute(sql, [values]);
        logger.info({ count: this.events.length }, 'Batch upsert completed');
    }
    async import() {
        await this.flushEvents();
    }
}
// ============================================================================
// Task Registration
// ============================================================================
export function registerGharchiveTasks(scheduler) {
    // Import single hourly file
    scheduler.define('gharchive.import.hourly', async (job) => {
        const { date, hour, force, upsert } = job.data;
        const hourStr = hour.toString().padStart(2, '0');
        const filename = `${date}-${hourStr}.json.gz`;
        logger.info({ date, hour, filename }, 'Starting GHArchive hourly import');
        try {
            // Delete existing data for this hour if force
            if (force) {
                await deleteEventsForHour(date, hour);
            }
            const importer = new GharchiveImporter(filename, { upsert });
            await importer.run();
            logger.info({ date, hour, filename }, 'GHArchive hourly import completed');
        }
        catch (error) {
            logger.error({ date, hour, filename, error }, 'GHArchive hourly import failed');
            throw error;
        }
    });
    // Import date range
    scheduler.define('gharchive.import.range', async (job) => {
        const { from, to, force, upsert } = job.data;
        logger.info({ from, to }, 'Starting GHArchive range import');
        const startDate = new Date(from);
        const endDate = new Date(to);
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            for (let hour = 0; hour < 24; hour++) {
                try {
                    await scheduler.enqueue('gharchive.import.hourly', {
                        date: dateStr,
                        hour,
                        force,
                        upsert
                    });
                }
                catch (error) {
                    logger.error({ date: dateStr, hour, error }, 'Failed to enqueue hourly import');
                }
            }
        }
        logger.info({ from, to }, 'GHArchive range import queued');
    });
    // Import missing files (from Ruby's :fix_missing task)
    scheduler.define('gharchive.import.missing', async () => {
        // Known missing files from Ruby task
        const missingFiles = [
            "2022-02-28-16", "2022-02-28-14", "2022-02-28-5", "2022-02-28-1",
            "2022-02-27-22", "2022-02-27-12", "2022-02-27-8", "2022-02-26-19",
            "2022-02-26-0", "2022-02-25-12", "2022-02-25-7", "2022-02-25-4",
            "2022-02-25-3", "2022-02-24-15", "2022-02-24-11", "2022-02-24-1",
            "2022-02-23-17", "2022-02-23-15", "2022-02-23-0", "2022-02-22-21",
            "2022-02-22-18", "2022-02-22-14", "2022-02-21-22", "2022-02-21-21",
            "2022-02-21-10", "2022-02-21-7", "2022-02-21-4", "2022-02-20-17",
            "2022-02-20-7", "2022-02-20-3", "2022-02-19-18", "2022-02-19-16",
            "2022-02-19-9", "2022-02-19-5", "2022-02-18-22", "2022-02-18-0",
            "2022-02-17-11", "2022-02-17-5", "2022-02-16-23", "2022-02-16-22",
            "2022-02-16-19", "2022-02-15-23", "2022-02-15-22", "2022-02-15-20",
            "2022-02-15-18", "2022-02-15-13", "2022-02-15-10", "2022-02-14-19",
            "2022-02-14-12", "2022-02-14-10", "2022-02-14-5", "2022-02-14-3",
            "2022-02-14-0", "2022-02-13-23", "2022-02-04-10", "2022-02-25-1",
            "2022-01-17-18", "2022-01-08-16", "2022-01-10-13"
        ];
        logger.info({ count: missingFiles.length }, 'Starting missing files import');
        for (const file of missingFiles) {
            const [date, hour] = file.split('-');
            try {
                await scheduler.enqueue('gharchive.import.hourly', {
                    date: `${date.split('-').slice(0, 3).join('-')}`,
                    hour: parseInt(hour, 10),
                    force: true
                });
            }
            catch (error) {
                logger.error({ file, error }, 'Failed to enqueue missing file import');
            }
        }
        logger.info('Missing files import queued');
    });
    // Schedule: Import previous hour (run at :30 of each hour)
    scheduler.schedule('gharchive.hourly.previous', '30 * * * *', async () => {
        const previousHour = new Date();
        previousHour.setUTCHours(previousHour.getUTCHours() - 1);
        const date = previousHour.toISOString().split('T')[0];
        const hour = previousHour.getUTCHours();
        logger.info({ date, hour }, 'Scheduling previous hour import');
        await scheduler.enqueue('gharchive.import.hourly', {
            date,
            hour,
            force: false
        });
    });
    // Schedule: Daily backfill (import 7 days ago, run at 3 AM)
    scheduler.schedule('gharchive.daily.backfill', '0 3 * * *', async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
        const date = sevenDaysAgo.toISOString().split('T')[0];
        logger.info({ date }, 'Scheduling daily backfill');
        for (let hour = 0; hour < 24; hour++) {
            await scheduler.enqueue('gharchive.import.hourly', {
                date,
                hour,
                force: false
            });
        }
    });
}
// ============================================================================
// Helper Functions
// ============================================================================
async function deleteEventsForHour(date, hour) {
    const pool = getDbPool();
    const hourStr = hour.toString().padStart(2, '0');
    const startTime = `${date} ${hourStr}:00:00`;
    const endTime = `${date} ${hourStr}:59:59`;
    logger.info({ date, hour, startTime, endTime }, 'Deleting existing events');
    let deleted = 0;
    while (true) {
        const [result] = await pool.execute(`DELETE FROM github_events WHERE created_at BETWEEN ? AND ? LIMIT 10000`, [startTime, endTime]);
        const affected = result.affectedRows || 0;
        deleted += affected;
        logger.debug({ deleted, affected }, 'Deleted batch');
        if (affected < 10000)
            break;
    }
    logger.info({ date, hour, totalDeleted: deleted }, 'Deletion completed');
}
//# sourceMappingURL=gharchive.js.map