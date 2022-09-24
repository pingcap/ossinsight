import consola, { Consola } from "consola"
import { Factory } from "generic-pool"

import { Octokit } from "octokit"
import { throttling } from "@octokit/plugin-throttling";
import { BatchLoader } from "../../app/core/BatchLoader";
import { ConnectionWrapper, getConnectionOptions } from "../../app/utils/db";

export const CustomOctokit = Octokit.plugin(throttling);
export const SYMBOL_TOKEN = Symbol('PERSONAL_TOKEN');

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
  conn: ConnectionWrapper;
  octokit: Octokit;
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
      if (this.tokens.size > 0) {
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
        const conn = new ConnectionWrapper(getConnectionOptions());

        // Init worker.
        const worker = {
          logger: log,
          conn: conn,
          octokit: octokit,
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
      } else {
        return Promise.reject('Out of personal tokens');
      }
    }
  
    async destroy(worker: JobWorker): Promise<void> {
      const { value } = Object.getOwnPropertyDescriptor(worker, SYMBOL_TOKEN)!
      this.tokens.add(value);
      const erasedToken = eraseToken(value);
      this.log.info('release client with token %s', erasedToken);
    }
}