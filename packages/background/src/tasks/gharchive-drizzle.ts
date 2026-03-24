/**
 * GHArchive ETL Tasks (Drizzle ORM Version)
 * 
 * Uses @ossinsight/database for type-safe database access
 */

import type { Orbital } from '@mini256/orbital';
import { logger } from '../logger.js';
import { getDatabase, githubEvents, importLogs, type NewGithubEvent } from '@ossinsight/database';
import { eq, and, sql } from 'drizzle-orm';
import https from 'https';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';

// ============================================================================
// Configuration
// ============================================================================

const GHARCHIVE_BASE_URL = 'http://data.gharchive.org';
const BATCH_SIZE = 90000;
const MAX_RETRIES = 5;
const DOWNLOAD_TIMEOUT = 600000;

// ============================================================================
// Types
// ============================================================================

export interface GharchiveImportData {
  date: string;
  hour: number;
  force?: boolean;
  upsert?: boolean;
}

// ============================================================================
// GHArchive Importer (Drizzle Version)
// ============================================================================

export class GharchiveImporterDrizzle {
  private filename: string;
  private url: string;
  private batchAt: Date;
  private importLogId!: number;
  private events: NewGithubEvent[] = [];
  private upsert: boolean;

  constructor(filename: string, options: { upsert?: boolean } = {}) {
    this.filename = filename;
    this.url = `${GHARCHIVE_BASE_URL}/${filename}`;
    this.batchAt = new Date();
    this.upsert = options.upsert ?? false;
  }

  async run(): Promise<void> {
    const db = getDatabase().drizzle;

    try {
      // Create import log
      const [logResult] = await db.insert(importLogs).values({
        filename: this.filename,
        startBatchAt: this.batchAt.toISOString(),
        status: 'pending',
      });

      this.importLogId = (logResult as any).insertId;

      // Download
      await this.updateLog({ status: 'downloading', startDownloadAt: new Date().toISOString() });
      const jsonStream = await this.download();
      await this.updateLog({ endDownloadAt: new Date().toISOString() });

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
      await this.updateLog({ status: 'importing', startImportAt: new Date().toISOString() });
      await this.import();
      await this.updateLog({ endImportAt: new Date().toISOString(), status: 'completed' });

      logger.info({ filename: this.filename, count: this.events.length }, 'Import completed');
    } catch (error) {
      logger.error({ filename: this.filename, error }, 'Import failed');
      await this.updateLog({ 
        status: 'failed', 
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private async updateLog(updates: Partial<typeof importLogs.$inferInsert>): Promise<void> {
    const db = getDatabase().drizzle;
    await db.update(importLogs).set(updates).where(eq(importLogs.id, this.importLogId));
  }

  private async download(): Promise<Readable | null> {
    logger.info({ url: this.url }, 'Starting download');
    
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        return await new Promise<Readable | null>((resolve, reject) => {
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
            resolve(response as unknown as Readable);
          });

          request.on('error', reject);
          request.on('timeout', () => {
            request.destroy();
            reject(new Error('Download timeout'));
          });
        });
      } catch (error) {
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

  private async parse(stream: Readable): Promise<void> {
    const gunzip = createGunzip();
    const decompressed = stream.pipe(gunzip);

    let buffer = '';
    
    for await (const chunk of decompressed) {
      buffer += chunk.toString('utf8');
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const event = JSON.parse(line);
          this.events.push(this.extractFields(event));
        } catch (error) {
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
      } catch (error) {
        logger.warn({ error }, 'Failed to parse final JSON line');
      }
    }

    if (this.events.length > 0) {
      await this.flushEvents();
    }
  }

  private extractFields(event: any): NewGithubEvent {
    const dateMatch = event.created_at?.match(/((\d{4})-\d{2})-\d{2}/);
    const eventDay = dateMatch ? dateMatch[0] : '1970-01-01';
    const eventMonth = dateMatch ? `${dateMatch[1]}-01` : '1970-01-01';
    const eventYear = dateMatch ? parseInt(dateMatch[2], 10) : 1970;

    return {
      id: event.id ? BigInt(event.id) : 0n,
      type: event.type || 'Event',
      actorId: event.actor?.id ? BigInt(event.actor.id) : 0n,
      actorLogin: event.actor?.login || '',
      repoId: event.repo?.id ? BigInt(event.repo.id) : 0n,
      repoName: event.repo?.name || '',
      orgId: event.org?.id ? BigInt(event.org.id) : 0n,
      orgLogin: event.org?.login || '',
      createdAt: event.created_at || '1970-01-01 00:00:00',
      
      language: event.payload?.pull_request?.base?.repo?.language || '',
      additions: event.payload?.pull_request?.additions || 0,
      deletions: event.payload?.pull_request?.deletions || 0,
      action: event.payload?.action || '',
      number: event.payload?.issue?.number || 
              event.payload?.pull_request?.number || 
              event.payload?.number || 0,
      commitId: event.payload?.comment?.commit_id || '',
      commentId: event.payload?.comment?.id ? BigInt(event.payload.comment.id) : 0n,
      state: event.payload?.pull_request?.state || event.payload?.issue?.state || '',
      closedAt: event.payload?.pull_request?.closed_at || 
                event.payload?.issue?.closed_at || '1970-01-01 00:00:00',
      comments: event.payload?.pull_request?.comments || 
                event.payload?.issue?.comments || 0,
      prMerged: event.payload?.pull_request?.merged || false,
      prMergedAt: event.payload?.pull_request?.merged_at || '1970-01-01 00:00:00',
      prChangedFiles: event.payload?.pull_request?.changed_files || 0,
      prReviewComments: event.payload?.pull_request?.review_comments || 0,
      prOrIssueId: event.payload?.pull_request?.id || 
                   event.payload?.issue?.id ? BigInt(event.payload.pull_request?.id || event.payload.issue?.id) : 0n,
      pushSize: event.payload?.size || 0,
      pushDistinctSize: event.payload?.distinct_size || 0,
      creatorUserId: event.payload?.comment?.user?.id || 
                     event.payload?.review?.user?.id || 
                     event.payload?.issue?.user?.id || 
                     event.payload?.pull_request?.user?.id ? 
                       BigInt(event.payload.comment?.user?.id || 
                              event.payload.review?.user?.id || 
                              event.payload.issue?.user?.id || 
                              event.payload.pull_request?.user?.id) : 0n,
      creatorUserLogin: event.payload?.comment?.user?.login || 
                        event.payload?.review?.user?.login || 
                        event.payload?.issue?.user?.login || 
                        event.payload?.pull_request?.user?.login || '',
      prOrIssueCreatedAt: event.payload?.issue?.created_at || 
                          event.payload?.pull_request?.created_at || 
                          '1970-01-01 00:00:00',
      
      eventDay,
      eventMonth,
      eventYear,
    };
  }

  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    logger.info({ count: this.events.length }, 'Flushing events to database');
    
    const db = getDatabase().drizzle;

    if (this.upsert) {
      await db.insert(githubEvents)
        .values(this.events)
        .onDuplicateKeyUpdate({
          additions: sql(`VALUES(additions)`),
          deletions: sql(`VALUES(deletions)`),
        });
    } else {
      await db.insert(githubEvents).values(this.events);
    }

    logger.info({ count: this.events.length }, 'Batch insert completed');
    this.events = [];
  }

  private async import(): Promise<void> {
    await this.flushEvents();
  }
}

// ============================================================================
// Task Registration
// ============================================================================

export function registerGharchiveTasks(scheduler: Orbital): void {
  scheduler.define('gharchive.import.hourly', async (job) => {
    const { date, hour, force, upsert } = job.data as GharchiveImportData;
    
    const hourStr = hour.toString().padStart(2, '0');
    const filename = `${date}-${hourStr}.json.gz`;
    
    logger.info({ date, hour, filename }, 'Starting GHArchive hourly import');
    
    try {
      if (force) {
        await deleteEventsForHour(date, hour);
      }
      
      const importer = new GharchiveImporterDrizzle(filename, { upsert });
      await importer.run();
      
      logger.info({ date, hour, filename }, 'GHArchive hourly import completed');
    } catch (error) {
      logger.error({ date, hour, filename, error }, 'GHArchive hourly import failed');
      throw error;
    }
  });

  scheduler.define('gharchive.import.range', async (job) => {
    const { from, to, force, upsert } = job.data as {
      from: string;
      to: string;
      force?: boolean;
      upsert?: boolean;
    };
    
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
        } catch (error) {
          logger.error({ date: dateStr, hour, error }, 'Failed to enqueue hourly import');
        }
      }
    }
    
    logger.info({ from, to }, 'GHArchive range import queued');
  });

  scheduler.define('gharchive.import.missing', async () => {
    const missingFiles = [
      "2022-02-28-16", "2022-02-28-14", "2022-02-28-5", "2022-02-28-1",
      // ... (same list as before)
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
      } catch (error) {
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

async function deleteEventsForHour(date: string, hour: number): Promise<void> {
  const db = getDatabase().drizzle;
  const hourStr = hour.toString().padStart(2, '0');
  const startTime = `${date} ${hourStr}:00:00`;
  const endTime = `${date} ${hourStr}:59:59`;
  
  logger.info({ date, hour, startTime, endTime }, 'Deleting existing events');
  
  let deleted = 0;
  while (true) {
    const result = await db.delete(githubEvents)
      .where(
        and(
          sql`created_at >= ${startTime}`,
          sql`created_at <= ${endTime}`
        )
      )
      .limit(10000);
    
    const affected = (result as any).affectedRows || 0;
    deleted += affected;
    
    if (affected < 10000) break;
  }
  
  logger.info({ date, hour, totalDeleted: deleted }, 'Deletion completed');
}
