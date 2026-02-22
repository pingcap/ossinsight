import { Command } from "commander";
import mysql2 from "mysql2/promise";
import { streamImportFile } from "../importers/gharchive.js";
import { bulkInsertEvents, deleteEventsInWindow } from "../importers/db-writer.js";
import type { GithubEventRecord } from "../models/github-event.js";
import { logger } from "../utils/logger.js";

/** `ossinsight-etl import hourly` — import a single hour of GH Archive data. */
export const importHourlyCommand = new Command("hourly")
  .description("Import a single GH Archive hourly file into TiDB")
  .option("--date <date>", "Date in YYYY-MM-DD format (defaults to yesterday)")
  .option("--hour <hour>", "Hour 0-23 (defaults to previous full hour)")
  .option("--no-delete", "Skip deleting existing events before import")
  .action(async (opts) => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      logger.error("DATABASE_URL environment variable is required");
      process.exit(1);
    }

    const now = new Date();
    const date = opts.date ?? formatDate(new Date(now.getTime() - 3600_000));
    const hour = opts.hour != null ? parseInt(opts.hour, 10) : new Date(now.getTime() - 3600_000).getUTCHours();
    const hourStr = String(hour).padStart(2, "0");
    const filename = `${date}-${hour}.json.gz`;

    logger.info({ date, hour: hourStr, filename }, "Starting hourly import");

    const pool = mysql2.createPool(databaseUrl);

    try {
      if (opts.delete !== false) {
        const windowStart = new Date(`${date}T${hourStr}:00:00Z`);
        const windowEnd = new Date(`${date}T${hourStr}:59:59Z`);
        const deleted = await deleteEventsInWindow(pool, windowStart, windowEnd);
        logger.info({ deleted }, "Cleared existing events");
      }

      const batch: GithubEventRecord[] = [];
      let totalInserted = 0;

      const flush = async () => {
        if (batch.length === 0) return;
        const inserted = await bulkInsertEvents(pool, batch.splice(0, batch.length));
        totalInserted += inserted;
      };

      const parsed = await streamImportFile(filename, async (record) => {
        batch.push(record);
        if (batch.length >= 5000) await flush();
      });

      await flush();

      logger.info({ filename, parsed, inserted: totalInserted }, "Hourly import complete");
    } catch (err: any) {
      if (err.message?.includes("404")) {
        logger.warn({ filename }, "GH Archive file not found (404), skipping");
      } else {
        logger.error({ err }, "Import failed");
        process.exit(1);
      }
    } finally {
      await pool.end();
    }
  });

/** `ossinsight-etl import range` — import a date range of GH Archive data. */
export const importRangeCommand = new Command("range")
  .description("Import a range of GH Archive files into TiDB")
  .requiredOption("--from <date>", "Start date YYYY-MM-DD")
  .requiredOption("--to <date>", "End date YYYY-MM-DD (inclusive)")
  .option("--no-delete", "Skip deleting existing events before import")
  .action(async (opts) => {
    const from = new Date(opts.from);
    const to = new Date(opts.to);

    const current = new Date(from);
    while (current <= to) {
      for (let hour = 0; hour <= 23; hour++) {
        const date = formatDate(current);
        // Re-invoke the hourly command via direct execution
        await importHourlyCommand.parseAsync(
          [
            "--date", date,
            "--hour", String(hour),
            ...(opts.delete === false ? ["--no-delete"] : []),
          ],
          { from: "user" }
        );
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }
  });

// ---------------------------------------------------------------------------

function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
