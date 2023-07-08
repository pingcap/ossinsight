import "reflect-metadata";
import {initSyncReposInBatchCommand} from "@commands/repos/sync-in-batch";
import {initSyncUsersInBatchCommand} from "@commands/users/sync-in-batch";
import {AppConfig, SyncGitHubDataEnvSchema} from "@env";
import {Command} from "commander";
import envSchema from "env-schema";
export const logger = require('./logger');

// Load environments.
const config: AppConfig = envSchema({
  schema: SyncGitHubDataEnvSchema,
  dotenv: true,
});

async function main() {
  const program = new Command();
  program.name('sync-github')
    .description('Sync GitHub data to database.')
    .version('0.1.0');

  const reposCommand = program.command('repos');
  initSyncReposInBatchCommand(reposCommand, config, logger);

  const usersCommand = program.command('users');
  initSyncUsersInBatchCommand(usersCommand, config, logger);

  program.parse();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
