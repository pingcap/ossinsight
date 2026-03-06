import {GithubUserDao} from "@dao/github-user-dao";
import {AppConfig} from "@env";
import {processInBatch, syncNodesInTimeRanges} from "@libs/concurrent";
import {DEFAULT_USER_TIME_RANGE_FILED, GitHubHelper, UserTimeRangeFiled} from "@libs/github/helper";
import {createOctokitPool} from "@libs/github/octokit";
import {splitTimeRange, TimeRange} from "@libs/times";
import {PrismaClient} from "@prisma/client";
import {GitHubUserNode} from "@typings/github";
import {Command} from "commander";
import {DateTime, Duration} from "luxon";
import {Logger} from "pino";

export interface Options {
  timeRangeField: UserTimeRangeFiled;
  from: DateTime;
  to: DateTime;
  desc: boolean;
  chunkSize: Duration;
  stepSize: Duration;
  filter: string;
}

/**
 * @sub-command sync-github users sync-in-batch
 * @description Sync GitHub users in batch.
 */
export function initSyncUsersInBatchCommand(pCommand: Command, config: AppConfig, logger: Logger) {
  pCommand.command('sync-in-batch')
    .description('Import the database in batches according to the user creation time with GitHub search API.')
    .requiredOption<String>(
      '--time-range-field <\'created\'>',
      'Search by when a user was created. Default: "created".',
      (value) => value,
      DEFAULT_USER_TIME_RANGE_FILED
    )
    .requiredOption<DateTime>(
      '--from <datetime>',
      'The start time of time range, which is followed SQL date time format. Default: "2018-02-08".',
      (value) => DateTime.fromSQL(value),
      // GitHub was founded in 2008: https://en.wikipedia.org/wiki/GitHub
      DateTime.fromSQL('2008-02-08')
    )
    .requiredOption<DateTime>(
      '--to <datetime>',
      'The end time of time range, which is followed SQL date time format. Default: now.',
      (value) => DateTime.fromSQL(value),
      DateTime.utc()
    )
    .option('-d, --desc', 'Whether to process time ranges in descending order. Default: false.')
    .requiredOption<Duration>(
      '--chunk-size <duration>',
      `The chunk size is used to spilt the large task to many small subtask, so that we can process them 
in concurrent. For example: --chunk-size='{ "days": 1 }'`,
      (value) => Duration.fromObject(JSON.parse(value)),
      Duration.fromObject({days: 1})
    )
    .requiredOption<Duration>(
      '--step-size <duration>',
      `The step size is used to control what is the interval of repository creation time for a request 
to obtain data. For example: --step-size='{ "minutes": 10 }'
`,
      (value) => Duration.fromObject(JSON.parse(value)),
      Duration.fromObject({minutes: 10})
    )
    .option('--filter [string]', `The query variable of GitHub GraphQL search API.
Reference: https://docs.github.com/en/search-github/searching-on-github/searching-users`)
    .action(async (options) => {
      await syncUsersInBatch(config, logger, options);
    });
}

export async function syncUsersInBatch(config: AppConfig, logger: Logger, options: Options) {
  const {timeRangeField, from, to, desc, chunkSize, stepSize, filter} = options;

  // Init GitHub helper.
  const octokitPool = createOctokitPool(logger, config.GITHUB_ACCESS_TOKENS);
  const githubHelper = new GitHubHelper(logger, octokitPool);

  // Init GitHub User DAO.
  const prisma = new PrismaClient();
  const githubUserDao = new GithubUserDao(logger, prisma);

  // Process in batch.
  const concurrent = octokitPool.max;
  const timeRanges = splitTimeRange(from, to, chunkSize, desc);
  await processInBatch<TimeRange>(timeRanges, concurrent, async ({tFrom, tTo}) => {
    try {
      logger.info(`🔄 Begin to sync users from ${tFrom.toISO()} to ${tTo.toISO()} ...`);
      await syncNodesInTimeRanges<GitHubUserNode>(logger, tFrom, tTo, stepSize, async (left, right) => {
        return await githubHelper.searchUsersByTimeRange(timeRangeField, left, right, filter);
      }, async (nodes) => {
        // Save the users to database.
        await githubUserDao.upsertUserNodes(nodes);
      });

      logger.info(`🔄 Finished to sync users from ${tFrom.toISO()} to ${tTo.toISO()}.`);
    } catch (err: any) {
      logger.error(err, `🔄 Failed to sync users from ${tFrom.toISO()} to ${tTo.toISO()}.`);
    }
  });
}
