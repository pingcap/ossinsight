/**
 * GHArchive ETL Tasks
 *
 * Implemented with Drizzle ORM for type-safe database access
 */
import { logger } from '../logger.js';
import { getDatabase, githubEvents } from '@ossinsight/database';
import { sql } from 'drizzle-orm';
import https from 'https';
import { createGunzip } from 'zlib';
// ============================================================================
// Configuration
// ============================================================================
const GHARCHIVE_BASE_URL = 'http://data.gharchive.org';
const BATCH_SIZE = 90000;
const MAX_RETRIES = 5;
const DOWNLOAD_TIMEOUT = 600000;
// ============================================================================
// GHArchive Importer
// ============================================================================
export class GharchiveImporter {
    filename;
    url;
    batchAt;
    importLogId;
    events = [];
    upsert;
    constructor(filename, options = {}) {
        this.filename = filename;
        this.url = `${GHARCHIVE_BASE_URL}/${filename}`;
        this.batchAt = new Date();
        this.upsert = options.upsert ?? false;
    }
    async run() {
        const db = getDatabase().drizzle;
        try {
            // Create import log using raw SQL
            const pool = getDatabase().pool;
            const [logResult] = await pool.execute(`INSERT INTO import_logs (filename, start_batch_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`, [this.filename, this.batchAt.toISOString(), 'pending', new Date().toISOString(), new Date().toISOString()]);
            this.importLogId = logResult.insertId;
            // Download
            await this.updateLog('status', 'downloading');
            await this.updateLog('start_download_at', new Date().toISOString());
            const jsonStream = await this.download();
            await this.updateLog('end_download_at', new Date().toISOString());
            if (!jsonStream) {
                logger.warn({ filename: this.filename }, 'Skipping 404 file');
                await this.updateLog('status', 'completed');
                return;
            }
            // Parse
            await this.updateLog('status', 'parsing');
            logger.info({ filename: this.filename }, 'Starting to parse JSON data');
            await this.parse(jsonStream);
            logger.info({ filename: this.filename, count: this.events.length }, 'Parsing completed');
            // Import
            await this.updateLog('status', 'importing');
            await this.updateLog('start_import_at', new Date().toISOString());
            await this.import();
            await this.updateLog('end_import_at', new Date().toISOString());
            await this.updateLog('status', 'completed');
            logger.info({ filename: this.filename, count: this.events.length }, 'Import completed');
        }
        catch (error) {
            logger.error({ filename: this.filename, error }, 'Import failed');
            await this.updateLog('status', 'failed');
            await this.updateLog('error_message', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }
    async updateLog(field, value) {
        const pool = getDatabase().pool;
        await pool.execute(`UPDATE import_logs SET ${field} = ?, updated_at = ? WHERE id = ?`, [value, new Date().toISOString(), this.importLogId]);
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
                    request.on('error', reject);
                    request.on('timeout', () => {
                        request.destroy();
                        reject(new Error('Download timeout'));
                    });
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
                const delay = Math.pow(2, retries) * 1000;
                logger.warn({ url: this.url, retry: retries, delay }, 'Retrying download');
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
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
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
            if (this.events.length >= BATCH_SIZE) {
                await this.flushEvents();
            }
        }
        if (buffer.trim()) {
            try {
                const event = JSON.parse(buffer);
                this.events.push(this.extractFields(event));
            }
            catch (error) {
                logger.warn({ error }, 'Failed to parse final JSON line');
            }
        }
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
            id: event.id ? Number(event.id) : 0,
            type: event.type || 'Event',
            created_at: event.created_at || '1970-01-01 00:00:00',
            repo_id: event.repo?.id ? Number(event.repo.id) : 0,
            repo_name: event.repo?.name || '',
            actor_id: event.actor?.id ? Number(event.actor.id) : 0,
            actor_login: event.actor?.login || '',
            language: event.payload?.pull_request?.base?.repo?.language || '',
            additions: event.payload?.pull_request?.additions || 0,
            deletions: event.payload?.pull_request?.deletions || 0,
            action: event.payload?.action || '',
            number: event.payload?.issue?.number ||
                event.payload?.pull_request?.number ||
                event.payload?.number || 0,
            commit_id: event.payload?.comment?.commit_id || '',
            comment_id: event.payload?.comment?.id ? Number(event.payload.comment.id) : 0,
            org_login: event.org?.login || '',
            org_id: event.org?.id ? Number(event.org.id) : 0,
            state: event.payload?.pull_request?.state || event.payload?.issue?.state || '',
            closed_at: event.payload?.pull_request?.closed_at ||
                event.payload?.issue?.closed_at || '1970-01-01 00:00:00',
            comments: event.payload?.pull_request?.comments ||
                event.payload?.issue?.comments || 0,
            pr_merged_at: event.payload?.pull_request?.merged_at || '1970-01-01 00:00:00',
            pr_merged: event.payload?.pull_request?.merged || false,
            pr_changed_files: event.payload?.pull_request?.changed_files || 0,
            pr_review_comments: event.payload?.pull_request?.review_comments || 0,
            pr_or_issue_id: event.payload?.pull_request?.id ||
                event.payload?.issue?.id ? Number(event.payload.pull_request?.id || event.payload.issue?.id) : 0,
            event_day: eventDay,
            event_month: eventMonth,
            event_year: eventYear,
            push_size: event.payload?.size || 0,
            push_distinct_size: event.payload?.distinct_size || 0,
            creator_user_login: event.payload?.comment?.user?.login ||
                event.payload?.review?.user?.login ||
                event.payload?.issue?.user?.login ||
                event.payload?.pull_request?.user?.login || '',
            creator_user_id: event.payload?.comment?.user?.id ||
                event.payload?.review?.user?.id ||
                event.payload?.issue?.user?.id ||
                event.payload?.pull_request?.user?.id ?
                Number(event.payload.comment?.user?.id ||
                    event.payload.review?.user?.id ||
                    event.payload.issue?.user?.id ||
                    event.payload.pull_request?.user?.id) : 0,
            pr_or_issue_created_at: event.payload?.issue?.created_at ||
                event.payload?.pull_request?.created_at ||
                '1970-01-01 00:00:00',
        };
    }
    async flushEvents() {
        if (this.events.length === 0)
            return;
        logger.info({ count: this.events.length }, 'Flushing events to database');
        const db = getDatabase().drizzle;
        if (this.upsert) {
            // Use raw SQL for upsert (more efficient for bulk operations)
            const values = this.events.map(e => `(${[
                e.id, `'${e.type}'`, `'${e.created_at}'`, e.repo_id, `'${e.repo_name}'`,
                e.actor_id, `'${e.actor_login}'`, `'${e.language}'`, e.additions, e.deletions,
                `'${e.action}'`, e.number, `'${e.commit_id}'`, e.comment_id, `'${e.org_login}'`,
                e.org_id, `'${e.state}'`, `'${e.closed_at}'`, e.comments, `'${e.pr_merged_at}'`,
                e.pr_merged ? 1 : 0, e.pr_changed_files, e.pr_review_comments,
                e.pr_or_issue_id, `'${e.event_day}'`, `'${e.event_month}'`, e.event_year,
                e.push_size, e.push_distinct_size, `'${e.creator_user_login}'`,
                e.creator_user_id, `'${e.pr_or_issue_created_at}'`
            ].join(',')})`).join(',');
            await db.execute(sql `
        INSERT INTO github_events (
          id, type, created_at, repo_id, repo_name,
          actor_id, actor_login, language, additions, deletions,
          action, number, commit_id, comment_id, org_login,
          org_id, state, closed_at, comments, pr_merged_at,
          pr_merged, pr_changed_files, pr_review_comments,
          pr_or_issue_id, event_day, event_month, event_year,
          push_size, push_distinct_size, creator_user_login,
          creator_user_id, pr_or_issue_created_at
        ) VALUES ${sql.raw(values)}
        ON DUPLICATE KEY UPDATE
          additions = VALUES(additions),
          deletions = VALUES(deletions)
      `);
        }
        else {
            await db.insert(githubEvents).values(this.events);
        }
        logger.info({ count: this.events.length }, 'Batch insert completed');
        this.events = [];
    }
    async import() {
        await this.flushEvents();
    }
}
// ============================================================================
// Task Registration
// ============================================================================
export function registerGharchiveTasks(scheduler) {
    scheduler.define('gharchive.import.hourly', async (job) => {
        const { date, hour, force, upsert } = job.data;
        const hourStr = hour.toString().padStart(2, '0');
        const filename = `${date}-${hourStr}.json.gz`;
        logger.info({ date, hour, filename }, 'Starting GHArchive hourly import');
        try {
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
    scheduler.define('gharchive.import.missing', async () => {
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
            const parts = file.split('-');
            const date = parts.slice(0, 3).join('-');
            const hour = parseInt(parts[3], 10);
            try {
                await scheduler.enqueue('gharchive.import.hourly', {
                    date,
                    hour,
                    force: true
                });
            }
            catch (error) {
                logger.error({ file, error }, 'Failed to enqueue missing file import');
            }
        }
        logger.info('Missing files import queued');
    });
    // Scheduled tasks
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
    const pool = getDatabase().pool;
    const hourStr = hour.toString().padStart(2, '0');
    const startTime = `${date} ${hourStr}:00:00`;
    const endTime = `${date} ${hourStr}:59:59`;
    logger.info({ date, hour, startTime, endTime }, 'Deleting existing events');
    let deleted = 0;
    while (true) {
        const [result] = await pool.execute(`DELETE FROM github_events WHERE created_at BETWEEN ? AND ? LIMIT 10000`, [startTime, endTime]);
        const affected = result.affectedRows || 0;
        deleted += affected;
        if (affected < 10000)
            break;
    }
    logger.info({ date, hour, totalDeleted: deleted }, 'Deletion completed');
}
//# sourceMappingURL=gharchive.js.map