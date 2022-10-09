import consola, { Consola } from "consola"
import { Factory } from "generic-pool"
import { Octokit } from "octokit"
import { throttling } from "@octokit/plugin-throttling";
import { BatchLoader } from "../../app/core/BatchLoader";
import { getConnectionOptions } from "../../app/utils/db";
import { Pool as GenericPool, createPool as createGenericPool } from "generic-pool";
import { createPool, Pool } from "mysql2/promise";

export const CustomOctokit = Octokit.plugin(throttling);
export const SYMBOL_TOKEN = Symbol('PERSONAL_TOKEN');

// Init logger.
const logger = consola.withTag('workers');

const INSERT_USERS_SQL = `INSERT IGNORE INTO github_users(
  id, login, type, is_bot, name, email, organization, address, public_repos, followers, followings, created_at, updated_at
) VALUES ?
ON DUPLICATE KEY UPDATE
  login = VALUES(login), type = VALUES(type), is_bot = VALUES(is_bot), name = VALUES(name), email = VALUES(email), organization = VALUES(organization),
  address = VALUES(address), public_repos = VALUES(public_repos), followers = VALUES(followers), 
  followings = VALUES(followings), created_at = VALUES(created_at), updated_at = VALUES(updated_at)
;`;

const INSERT_REPOS_SQL = `INSERT IGNORE INTO github_repos (
  repo_id, repo_name, owner_id, owner_login, owner_is_org, description, primary_language, license, size, stars, forks, 
  is_fork, is_archived, latest_released_at, parent_repo_id, pushed_at, created_at, updated_at
) VALUES ?
ON DUPLICATE KEY UPDATE
  repo_id = VALUES(repo_id), repo_name = VALUES(repo_name), owner_id = VALUES(owner_id), owner_login = VALUES(owner_login), owner_is_org = VALUES(owner_is_org), description = VALUES(description), 
  primary_language = VALUES(primary_language), license = VALUES(license), size = VALUES(size), stars = VALUES(stars), forks = VALUES(forks), is_fork = VALUES(is_fork), 
  is_archived = VALUES(is_archived), latest_released_at = VALUES(latest_released_at), parent_repo_id = VALUES(parent_repo_id), pushed_at = VALUES(pushed_at), created_at = VALUES(created_at), updated_at = VALUES(updated_at)
;`;
const INSERT_REPOS_LANGUAGES_SQL = `INSERT IGNORE INTO github_repo_languages (repo_id, language, size) VALUES ?
ON DUPLICATE KEY UPDATE repo_id = VALUES(repo_id), language = VALUES(language), size = VALUES(size)
;`;
const INSERT_REPO_TOPICS_SQL = `INSERT IGNORE INTO github_repo_topics (repo_id, topic) VALUES ?
ON DUPLICATE KEY UPDATE repo_id = VALUES(repo_id), topic = VALUES(topic)
;`;

export function eraseToken (value: string | undefined): string {
    return value ? `****${value.substring(value.length - 8)}` : 'anonymous';
}

export interface JobWorker {
  logger: Consola;
  conn: Pool;
  octokit: Octokit;
  userLoader: BatchLoader;
  repoLoader: BatchLoader;
  repoLangLoader: BatchLoader;
  repoTopicLoader: BatchLoader;
}

export class WorkerFactory implements Factory<JobWorker> {
    private tokens: Set<string | undefined> = new Set()
    private log: Consola;
  
    constructor(tokens: string[]) {
      this.log = consola.withTag('worker-factory')
      tokens.forEach(token => this.tokens.add(token))
      this.log.info('create with %s tokens', tokens.length)
    }
  
    async create(): Promise<JobWorker> {
      if (this.tokens.size <= 0) {
        throw new Error('Out of personal tokens');
      }

      // Get access token.
      const { value } = this.tokens.keys().next()
      const erasedToken = eraseToken(value)
      const log = consola.withTag(`worker:${erasedToken}`)
      this.tokens.delete(value);

      // Init octokit client.
      const octokit = new CustomOctokit({
        auth: value,
        log,
        throttle: {
          onRateLimit: (retryAfter: number, options: any, octokit: Octokit) => {
            octokit.log.warn(
              `Request quota exhausted for request ${options.method} ${options.url}`
            );
      
            if (options.request.retryCount <= 1) {
              // only retries once
              octokit.log.info(`Retrying after ${retryAfter} seconds!`);
              return true;
            }
          },
          onSecondaryRateLimit: (retryAfter: number, options: any, octokit: Octokit) => {
            octokit.log.warn(
              `SecondaryRateLimit detected for request ${options.method} ${options.url}`
            );

            if (options.request.retryCount <= 1) {
              // only retries once
              octokit.log.info(`Retrying after ${retryAfter} seconds!`);
              return true;
            }
          },
        },
      });

      // Init TiDB client.
      const conn = createPool(getConnectionOptions({
        connectionLimit: 2
      }));

      // Init worker.
      const worker = {
        logger: log,
        conn: conn,
        octokit: octokit,
        userLoader: new BatchLoader(conn, INSERT_USERS_SQL, {
          batchSize: 2000
        }),
        repoLoader: new BatchLoader(conn, INSERT_REPOS_SQL, {
          batchSize: 2000
        }),
        repoLangLoader: new BatchLoader(conn, INSERT_REPOS_LANGUAGES_SQL, {
          batchSize: 2000
        }),
        repoTopicLoader: new BatchLoader(conn, INSERT_REPO_TOPICS_SQL, {
          batchSize: 2000
        })
      };

      Object.defineProperty(worker, SYMBOL_TOKEN, {value, writable: false, enumerable: false, configurable: false});
      this.log.info('Create worker with GitHub token %s.', erasedToken);

      return worker;
    }
  
    async destroy(worker: JobWorker): Promise<void> {
      const { value } = Object.getOwnPropertyDescriptor(worker, SYMBOL_TOKEN)!
      this.tokens.add(value);
      const erasedToken = eraseToken(value);
      this.log.info('Release client with token %s', erasedToken);
    }
}

export function createWorkerPool(tokens: string[]):GenericPool<JobWorker> {
  // Notice: every worker has one octokit client.
  const workerPool = createGenericPool(new WorkerFactory(tokens), {
      min: 0,
      max: tokens.length
  }).on('factoryCreateError', function (err) {
      logger.error('factoryCreateError', err)
  }).on('factoryDestroyError', function (err) {
      logger.error('factoryDestroyError', err)
  });
  return workerPool;
}