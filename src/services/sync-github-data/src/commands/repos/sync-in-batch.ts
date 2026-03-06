import {GithubRepoDao} from "@dao/github-repo-dao";
import {AppConfig} from "@env";
import {processInBatch, syncNodesInTimeRanges} from "@libs/concurrent";
import {DEFAULT_REPO_TIME_RANGE_FILED, GitHubHelper, RepoTimeRangeFiled} from "@libs/github/helper";
import {createOctokitPool} from "@libs/github/octokit";
import {splitTimeRange, TimeRange} from "@libs/times";
import {PrismaClient} from "@prisma/client";
import {GitHubRepoNode} from "@typings/github";
import {Command} from "commander";
import {DateTime, Duration, DurationLike} from "luxon";
import {Logger} from "pino";

export interface Options {
  timeRangeField: RepoTimeRangeFiled;
  from: DateTime;
  to: DateTime;
  chunkSize: Duration;
  stepSize: Duration;
  filter: string;
  desc: boolean;
}

/**
 * @sub-command sync-github repos sync-in-batch
 * @description Sync repos in batch by GitHub search API.
 */
export function initSyncReposInBatchCommand(pCommand: Command, config: AppConfig, logger: Logger) {
  pCommand.command('sync-in-batch')
    .description('Sync repos in batch by GitHub search API.')
    .requiredOption<String>(
      '--time-range-field <\'created\'|\'pushed\'>',
      'Search by when a repository was created or last updated. Default: "created".',
      (value) => value,
      DEFAULT_REPO_TIME_RANGE_FILED
    )
    .requiredOption<DateTime>(
      '--from <string>',
      'The start time of time range, which is followed SQL date time format. Default: "2018-02-08".',
      (value) => DateTime.fromSQL(value),
      // GitHub was founded in 2008: https://en.wikipedia.org/wiki/GitHub
      DateTime.fromSQL('2008-02-08')
    )
    .requiredOption<DateTime>(
      '--to <string>',
      'The end time of time range, which is followed SQL date time format. Default: now.',
      (value) => DateTime.fromSQL(value),
      DateTime.utc()
    )
    .option('-d, --desc', 'Whether to process time ranges in descending order. Default: false.')
    .requiredOption<DurationLike>(
      '--chunk-size <duration>',
      `The chunk size is used to spilt the large task to many small subtask, so that we can process them 
in concurrent. For example: --chunk-size='{ "days": 1 }'`,
      (value) => Duration.fromObject(JSON.parse(value)),
      Duration.fromObject({days: 1})
    )
    .requiredOption<DurationLike>(
      '--step-size <duration>',
      `The step size is used to control what is the interval of repository creation time for a request 
to obtain data. For example: --step-size='{ "minutes": 10 }'
`,
      (value) => Duration.fromObject(JSON.parse(value)),
      Duration.fromObject({minutes: 10})
    )
    .option('--filter [string]', `The query variable of GitHub GraphQL search API.
Reference: https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories`)
    .action(async (options: Options) => {
      await syncReposInBatch(config, logger, options);
    });
}

export async function syncReposInBatch(config: AppConfig, logger: Logger, options: Options) {
  const {timeRangeField, from, to, chunkSize, stepSize, filter, desc} = options;

  // Init GitHub Repo DAO.
  const prisma = new PrismaClient();
  const githubRepoDao = new GithubRepoDao(logger, prisma);

  // Init the GitHub helper.
  const octokitPool = createOctokitPool(logger, config.GITHUB_ACCESS_TOKENS);
  const githubHelper = new GitHubHelper(logger, octokitPool);

  // Process in batch.
  const concurrent = octokitPool.max;
  const timeRanges = splitTimeRange(from, to, chunkSize, desc);
  await processInBatch<TimeRange>(timeRanges, concurrent, async ({tFrom, tTo}) => {
    try {
      logger.info(`🔄 Begin to sync repos by ${timeRangeField} from ${tFrom.toISO()} to ${tTo.toISO()} ...`);
      await syncNodesInTimeRanges<GitHubRepoNode>(logger, tFrom, tTo, stepSize, async (left, right) => {
        return await githubHelper.searchReposByTimeRange(timeRangeField, left, right, filter);
      }, async (nodes) => {
        // Save the data to database.
        await githubRepoDao.upsertRepoNodes(nodes);
        await githubRepoDao.upsertRepoLanguageNodes(nodes);
        await githubRepoDao.upsertRepoTopicNodes(nodes);
      });

      logger.info(`🔄 Finished to sync repos by ${timeRangeField} from ${tFrom.toISO()} to ${tTo.toISO()}.`);
    } catch (err: any) {
      logger.error(err, `🔄 Failed to sync repos by ${timeRangeField} from ${tFrom.toISO()} to ${tTo.toISO()}.`);
    }
  });
}
