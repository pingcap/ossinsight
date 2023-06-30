import {GithubRepoDao} from "@dao/github-repo-dao";
import {AppConfig} from "@env";
import {splitTimeRange} from "@libs/times";
import {PrismaClient} from "@prisma/client";
import {Command} from "commander";
import {DateTime, DurationLike} from "luxon";
import {Logger} from "pino";

export interface Option {
  eventType: 'PushEvent' | 'PullRequestEvent',
  from: DateTime;
  to: DateTime;
  chunkSize: DurationLike
}

/**
 * @sub-command sync-github repos pull
 * @description Pull GitHub repositories from `github_events` table.
 */
export function InitPullReposCommand(command: Command, config: AppConfig, logger: Logger) {
  command
    .command('pull')
    .description('Pull repositories data from github_events table.')
    .requiredOption<string>(
      '-e, --event-type <event_type>',
      'Specifies which type of event to extract repo data from. Default: "PushEvent".',
      (value) => value,
      'PushEvent'
    )
    .requiredOption<DateTime>(
      '-f, --from <datetime>',
      'The start time of time range, which is followed SQL date time format. Default: "2011-01-01".',
      (value) => DateTime.fromSQL(value),
      // GitHub was founded in 2008: https://en.wikipedia.org/wiki/GitHub
      DateTime.fromSQL('2011-01-01')
    )
    .requiredOption<DateTime>(
      '-t, --to <datetime>',
      'The end time of time range, which is followed SQL date time format. Default: now.',
      (value) => DateTime.fromSQL(value),
      DateTime.now()
    )
    .requiredOption<DurationLike>(
      '-c, --chunk <duration>',
      'Specifies the time interval divided by the time range. Default: {"days": 1}',
      (value) => JSON.parse(value),
      {days: 1}
    )
    .action(async (options) => {
      await pullReposInBatch(logger, config, options);
    });
}

async function pullReposInBatch(logger: Logger, config: AppConfig, options: Option) {
  const {eventType, from, to, chunkSize} = options;
  const prisma = new PrismaClient();
  const githubRepoDao = new GithubRepoDao(logger, prisma);
  const timeRanges = splitTimeRange(from, to, chunkSize);

  switch (eventType) {
    case 'PushEvent':
      for (const {tFrom, tTo} of timeRanges) {
        await githubRepoDao.pullOrgReposFromPushEvents(tFrom, tTo);
        await githubRepoDao.pullUserReposFromPushEvents(tFrom, tTo);
      }
      break;
    case 'PullRequestEvent':
      for (const {tFrom, tTo} of timeRanges) {
        await githubRepoDao.pullOrgReposFromPullRequestEvents(tFrom, tTo);
        await githubRepoDao.pullUserReposFromPullRequestEvents(tFrom, tTo);
      }
      break;
    default:
      throw new Error(`Unknown event type: ${eventType}`);
  }
}

