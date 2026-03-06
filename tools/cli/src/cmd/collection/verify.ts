import {Command} from "commander";
import {logger} from "@logger";
import {
  listCollections,
  listAllCollections
} from "@db/collections";
import {loadCollectionConfigs} from "@configs";
import * as process from "node:process";
import {findReposByNames, upsertGitHubRepo} from "@db/github_repos";
import {booleanParser, DEFAULT_COLLECTION_CONFIGS_BASE_DIR, stringParser} from "@cmd/collection/common";
import { Octokit } from "octokit";
import {envConfig} from "@env";

const GITHUB_REPO_NAME_REGEXP = /^[a-zA-Z0-9-]+\/[a-zA-Z0-9._-]{1,100}$/;

export function initVerifyCollectionCommand(collectionCmd: Command) {
  collectionCmd
    .command('verify')
    .description('Verify collection configs.')
    .option<string>(
      '-d, --base-dir <directory>',
      'The base directory stored the collection config',
      stringParser,
      DEFAULT_COLLECTION_CONFIGS_BASE_DIR
    )
    .option<boolean>(
      '-f, --fail-fast',
      'If an error is encountered, the process will be terminated immediately',
      booleanParser,
      true
    )
    .option<boolean>(
      '-s, --fix-suggestion',
      'Show the suggestion to fix the validation error',
      booleanParser,
      true
    )
    .action(verifyCollectionConfigs);
}

export async function verifyCollectionConfigs(args: any) {
  try {
    const { baseDir, fastFail, fixSuggestion } = args;

    const configsMap = await loadCollectionConfigs(baseDir);
    logger.info(`Loaded ${configsMap.size} collections from config files in the directory ${baseDir}.`);

    const collections = await listCollections();
    logger.info(`Loaded ${collections.length} collections from database.`);

    const oldCollectionIds = new Set(collections.map((c) => c.id));
    const newCollectionIds = new Set(configsMap.keys());

    // Notice: All collections include the archived collections, which were marked as deleted with deleted_at field.
    const allCollections = await listAllCollections();
    const existsCollectionIds = new Set(allCollections.map((c) => c.id));
    const existsCollectionNames = new Set(allCollections.map((c) => c.name));

    const reposNotFound = new Set<string>();
    const errors: Error[] = [];
    const throwError = fastFail ?
      (err: Error) => { throw err; } :
      (err: Error) => { errors.push(err); };

    for (const config of configsMap.values()) {
      const { id: collectionId, name: collectionName, items: collectionRepos } = config;
      logger.debug(`Checking collection [${collectionName}](id: ${collectionId}) ...`)

      // Check if the new collection configs is valid.
      if (!oldCollectionIds.has(collectionId) && newCollectionIds.has(collectionId)) {
        if (existsCollectionIds.has(collectionId)) {
          throwError(new Error(`Collection [${collectionName}]: collection id ${collectionId} has been allocated, please consider using another one instead.`));
        }
        if (existsCollectionNames.has(collectionName)) {
          throwError(new Error(`Collection [${collectionName}]: collection name ${collectionName} has been allocated, please consider using another one instead.`));
        }
      }

      // Check if the repos in the collection is duplicate.
      const repoNameSet = new Set<string>();
      for (let collectionRepo of collectionRepos) {
        if (!isValidRepoName(collectionRepo)) {
          throwError(new Error(`Collection [${collectionName}](id: ${collectionId}): the format of repo name "${collectionRepo}" is wrong.`))
        }
        if (repoNameSet.has(collectionRepo)) {
          throwError(new Error(`Collection [${collectionName}](id: ${collectionId}): the repo name "${collectionRepo}" is duplicate.`));
        } else {
          repoNameSet.add(collectionRepo);
        }
      }

      // Check if the repos in the collection is all existed.
      const repos = await findReposByNames(collectionRepos);
      if (repos.length < collectionRepos.length) {
        const diffRepos = collectionRepos.filter(name => !repos.some(r => r.repo_name === name));
        diffRepos.forEach((r) => reposNotFound.add(r));
        if (diffRepos.length > 0) {
          throwError(new Error(`Collection [${collectionName}](id: ${collectionId}): can not find some repos by names: ${diffRepos.join(', ')}`));
        }
      }

      logger.info(`✅  Checked collection [${collectionName}](id: ${collectionId}).`)
    }

    // Without fast fail mode, when an error is encountered, it will continue to run until all checks are completed
    // and then output all errors together.
    if (errors.length > 0) {
      logger.error(`❌  Failed to verify collection configs, please check error messages as follows and modify the configs：`);
      for (let error of errors) {
        logger.error(error.message);
      }

      if (fixSuggestion) {
        await showFixRepoNamesSuggestions(baseDir, Array.from(reposNotFound));
      }

      process.exit(1);
    }

    logger.info(`✅  Pass all the check.`)
    process.exit(0);
  } catch (e: any) {
    logger.error(e, `❌  Failed to verify collection configs, please check the configs.`);
    process.exit(1);
  }
}

function splitOwnerRepo(data: string) {
  const [owner, repo] = data.split('/');
  return { owner, repo };
}

function isValidRepoName(repoName: string) {
  return GITHUB_REPO_NAME_REGEXP.test(repoName);
}

export async function showFixRepoNamesSuggestions(baseDir: string, repoNames: string[]) {
  logger.info(`Trying to fix the wrong repo names and generate fix suggestions...`)
  const octokit = new Octokit({
    auth: envConfig.GITHUB_ACCESS_TOKENS[0]
  });

  let commands: string[] = [];
  for (let oldName of repoNames) {
    try {
      const { owner, repo } = splitOwnerRepo(oldName);
      const { data: repository } = await octokit.rest.repos.get({
        owner: owner,
        repo: repo
      });
      const newName = repository.full_name;
      logger.info(`Fetched github repo by name ${oldName}, the repo name has changed to ${newName}`);

      // Updated the github_repos table.
      await upsertGitHubRepo({
        repo_id: repository.id,
        repo_name: repository.full_name,
        owner_id: repository.owner.id,
        owner_login: repository.owner.login,
        owner_is_org: Number(repository.owner.type === 'Organization')
      })

      // Generate the fix command.
      commands.push(`find . -name "*.yml" -exec sed -i '' 's/${oldName.replace('/', '\\/')}/${newName.replace('/', '\\/')}/g' {} +`);
    } catch (e) {
      logger.error(`❌ Failed to fetch github repo by name ${oldName}.`);
    }
  }
  const suggestion = `cd ${baseDir}\n${commands.join(';\n')}`;
  logger.info(`💡 Try to fix the wrong repo names by following commands:\n\n${suggestion}`)
}
