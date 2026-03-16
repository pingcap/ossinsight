import {AppConfig} from "@env";
import {Command} from "commander";
import {createPool} from "mysql2/promise";
import {Logger} from "pino";

/**
 * @sub-command sync-github users format-orgs
 * @description Format organization name of users in batch.
 */
export function initFormatOrgsCommand(command: Command, config: AppConfig, logger: Logger) {
  command.command('format-orgs')
    .description('Format organization name of users in batch.')
    .action(async (options) => {
      // Init TiDB client.
      const pool = createPool({
        uri: config.DATABASE_URL
      });

      logger.info('Start organization\'s name formatting.');
      // await formatOrgNamesInBatch(logger, pool);
      logger.info('Finished organization\'s name formatting.');

      await pool.end();
    });
}
