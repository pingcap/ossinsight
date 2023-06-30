import {AppConfig} from "@env";
import async from "async";
import {Command} from "commander";
import {existsSync, readFileSync} from "fs";
import {createPool, Pool, ResultSetHeader} from "mysql2/promise";
import path from "path";
import {Logger} from "pino";
import YAML from "yaml";

const UPDATE_IS_BOT_BY_EQUAL_SQL = `
    UPDATE github_users
    SET is_bot = 1
    WHERE is_bot = 0
      AND login = ?
`;

const UPDATE_IS_BOT_BY_LIKE_SQL = `
    UPDATE github_users
    SET is_bot = 1
    WHERE is_bot = 0
      AND login LIKE ?
    LIMIT ?
`;

/**
 * @sub-command sync-github users mark-bots
 * @description Identify bots and update the `is_bot` field.
 */
export function initMarkBotsCommand(command: Command, config: AppConfig, logger: Logger) {
  command.command('mark-bots')
    .description('Identify bots and update the `is_bot` field.')
    .requiredOption<number>('--concurrent <num>', '', (value) => Number(value), 4)
    .action(async (options) => {
      const {concurrent} = options;

      // Init TiDB client.
      const pool = createPool({
        uri: config.DATABASE_URL
      });

      const botLogins = loadBotLoginsConfig(logger);
      logger.info(`Found ${botLogins.length} bot logins.`);

      logger.info('Start bots identifying in batch.');
      await identifyBotsInBatch(logger, pool, concurrent, botLogins);
      logger.info('Finished bots identifying in batch.');

      await pool.end();
    });
}

export async function identifyBotsInBatch(logger: Logger, pool: Pool, concurrent: number, botLogins: string[]) {
  // Workers ready.
  const queue = async.queue<string>(async (botLogin) => {
    if (!botLogin && botLogin.length === 0) {
      return
    }

    if (botLogin[botLogin.length - 1] === '%') {
      // Fuzzy matching by prefix.
      try {
        while (true) {
          const batchSize = 1000;
          const [rs] = await pool.execute<ResultSetHeader>(UPDATE_IS_BOT_BY_LIKE_SQL, [botLogin, batchSize]);
          logger.info(`Update ${rs.affectedRows} users' \`is_bot\` field by pattern ${botLogin}.`);
          if (rs.affectedRows >= batchSize) {
            continue;
          } else {
            break;
          }
        }
      } catch (err) {
        logger.error(`Failed to updated users' info by pattern ${botLogin}: `, err);
      }
    } else {
      // Equal.
      try {
        const [rs] = await pool.execute<ResultSetHeader>(UPDATE_IS_BOT_BY_EQUAL_SQL, [botLogin]);
        logger.info(`Update ${rs.affectedRows} users' \`is_bot\` field by login ${botLogin}.`);
      } catch (err) {
        logger.error(`Failed to updated users' info by login ${botLogin}: `, err);
      }
    }
  }, concurrent);

  for (const botLogin of botLogins) {
    if (queue.started) {
      await queue.unsaturated();
    }
    await queue.push(botLogin);
  }

  await queue.drain();
}

function loadBotLoginsConfig(logger: Logger) {
  const configFile = path.resolve(__dirname, '@bots.yaml');
  if (existsSync(configFile)) {
    const originFile = readFileSync(configFile, 'utf8');
    const {bot_github_logins} = YAML.parse(originFile) as { bot_github_logins: string[] };

    if (Array.isArray(bot_github_logins)) {
      return bot_github_logins;
    }
  } else {
    logger.info(`Didn't found bots.yaml file.`);
  }
  return [];
}