import {GithubRepoDao} from "@dao/github-repo-dao";
import {AppConfig} from "@env";
import {GitHubHelper} from "@libs/github/helper";
import {createOctokitPool} from "@libs/github/octokit";
import {PrismaClient} from "@prisma/client";

import async from "async";
import {Command} from "commander";
import {Logger} from "pino";

/**
 * @sub-command sync-github repos mark-deleted
 * @description Mark deleted repositories in th `github_repos` table.
 */
export function initMarkDeletedReposCommand(pCommand: Command, config: AppConfig, logger: Logger) {
  pCommand
    .command('mark-deleted')
    .description('Mark deleted repositories in th `github_repos` table.')
    .action(async () => {
      await markDeletedRepos(logger, config);
    });
}

export async function markDeletedRepos(logger: Logger, config: AppConfig) {
  const octokitPool = createOctokitPool(logger, config.GITHUB_ACCESS_TOKENS);
  const concurrent = octokitPool.max;
  const gitHubHelper = new GitHubHelper(logger, octokitPool);
  const prisma = new PrismaClient();
  const githubRepoDao = new GithubRepoDao(logger, prisma);
  const publicReposLimit = 20000;

  // Prepare workers.
  const queue = async.queue<any>(async (user) => {
    console.log(githubRepoDao, publicReposLimit)
  }, concurrent);

  // Generate jobs.
  const maxUserId = await gitHubHelper.getBiggestUserId();
  for (let userId = 1; userId <= maxUserId; userId = userId + 100) {
    const users = await gitHubHelper.listUsers(userId);
    for (const user of users) {
      await queue.push(user);
    }
    await queue.empty();
  }

  await queue.drain();
}

