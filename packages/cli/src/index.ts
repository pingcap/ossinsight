#!/usr/bin/env node
import "reflect-metadata";
import "dotenv/config";
import {Command} from "commander";
import {initReloadCollectionCommand} from "@cmd/collection/reload";
import {logger} from "@logger";
import {initVerifyCollectionCommand} from "@cmd/collection/verify";

// ETL: GH Archive import commands (from @ossinsight/etl)
import {importHourlyCommand, importRangeCommand} from "@ossinsight/etl/lib";

// Sync: GitHub repo/user sync commands (from @ossinsight/sync-github-data)
import {
  initSyncReposInBatchCommand,
  initSyncUsersInBatchCommand,
  SyncGitHubDataEnvSchema,
  AppConfig,
} from "@ossinsight/sync-github-data/lib";
import envSchema from "env-schema";

async function main() {
  const program = new Command();
  program
    .name('ossinsight')
    .description('The unified CLI for OSSInsight.')
    .version('0.0.1');

  // ── collection commands ──────────────────────────────────────────────────
  const collectionCmd = program.command('collection')
    .description('Manage OSSInsight collections.');
  initReloadCollectionCommand(collectionCmd);
  initVerifyCollectionCommand(collectionCmd);

  // ── etl commands ─────────────────────────────────────────────────────────
  const etlCmd = program.command('etl')
    .description('Import GH Archive event data into TiDB.');
  const etlImportCmd = etlCmd.command('import')
    .description('Import a GH Archive file.');
  etlImportCmd.addCommand(importHourlyCommand);
  etlImportCmd.addCommand(importRangeCommand);

  // ── sync commands ────────────────────────────────────────────────────────
  const config: AppConfig = envSchema<AppConfig>({
    schema: SyncGitHubDataEnvSchema,
    dotenv: true,
  });

  const syncCmd = program.command('sync')
    .description('Sync GitHub user/repo data to TiDB.');
  const syncReposCmd = syncCmd.command('repos')
    .description('Sync GitHub repository data.');
  initSyncReposInBatchCommand(syncReposCmd, config, logger);

  const syncUsersCmd = syncCmd.command('users')
    .description('Sync GitHub user data.');
  initSyncUsersInBatchCommand(syncUsersCmd, config, logger);

  program.parse();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
