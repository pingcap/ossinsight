import consola from "consola";
import { DateTime } from "luxon";
import { Pool } from "mysql2/promise";
import { BatchLoader } from "../../app/core/BatchLoader";
import { createWorkerPool } from "../../app/core/GenericJobWorkerPool";
import { GitHubRepo } from "./types";

export interface WorkerPayload {
    repoLoader: BatchLoader;
    repoLangLoader: BatchLoader;
    repoTopicLoader: BatchLoader;
}

const logger = consola.withTag('repo-loader');

const INSERT_REPOS_SQL = `INSERT INTO github_repos (
    repo_id, repo_name, owner_id, owner_login, owner_is_org, 
    description, primary_language, license, size, stars, forks, is_fork, is_archived,
    latest_released_at, parent_repo_id, pushed_at, created_at, updated_at, refreshed_at
  ) VALUES ?
  ON DUPLICATE KEY UPDATE
    repo_id = VALUES(repo_id), repo_name = VALUES(repo_name), owner_id = VALUES(owner_id), owner_login = VALUES(owner_login), owner_is_org = VALUES(owner_is_org), 
    description = VALUES(description), primary_language = VALUES(primary_language), license = VALUES(license), 
    size = VALUES(size), stars = VALUES(stars), forks = VALUES(forks), is_fork = VALUES(is_fork), is_archived = VALUES(is_archived), 
    latest_released_at = VALUES(latest_released_at), parent_repo_id = VALUES(parent_repo_id), 
    pushed_at = VALUES(pushed_at), created_at = VALUES(created_at), updated_at = VALUES(updated_at),
    refreshed_at = VALUES(refreshed_at)
;`;

const INSERT_REPO_LANGUAGES_SQL = `INSERT INTO github_repo_languages (repo_id, language, size) VALUES ?
ON DUPLICATE KEY UPDATE repo_id = VALUES(repo_id), language = VALUES(language), size = VALUES(size)
;`;

const INSERT_REPO_TOPICS_SQL = `INSERT INTO github_repo_topics (repo_id, topic) VALUES ?
ON DUPLICATE KEY UPDATE repo_id = VALUES(repo_id), topic = VALUES(topic)
;`;

const MAX_BIGINT_VALUE = 9223372036854775807;

export function createSyncReposWorkerPool(tokens: string[]) {
    return createWorkerPool<WorkerPayload>(tokens, (connPool: Pool) => {
        return {
            repoLoader: new BatchLoader(connPool, INSERT_REPOS_SQL, {
                batchSize: 1000
            }),
            repoLangLoader: new BatchLoader(connPool, INSERT_REPO_LANGUAGES_SQL, {
                batchSize: 1000
            }),
            repoTopicLoader: new BatchLoader(connPool, INSERT_REPO_TOPICS_SQL, {
                batchSize: 1000
            })
        }
    }, async ({ repoLoader, repoLangLoader, repoTopicLoader }: WorkerPayload) => {
        await repoLoader.flush();
        await repoLangLoader.flush();
        await repoTopicLoader.flush();
    });
}

export async function loadGitHubRepos(repoLoader: BatchLoader, repos: GitHubRepo[]): Promise<number> {
    for (const repo of repos) {
        await loadGitHubRepo(repoLoader, repo);
    }
    return repos.length;
}

export async function loadGitHubRepo(repoLoader: BatchLoader, repo: GitHubRepo) {
    let {
        repoId, repoName, ownerId, ownerLogin, ownerIsOrg, 
        description, primaryLanguage, license, 
        size, stars, forks, isFork, isArchived, 
        latestReleasedAt, parentRepoId, pushedAt, createdAt, updatedAt
    } = repo;

    const descriptionValue = description ? description.substring(0, 512) : '';
    let sizeValue = 0;
    if (typeof size === 'number' && size < MAX_BIGINT_VALUE) {
        sizeValue = size
    } else {
        logger.warn(`Unexpected size value: `, size);
    }
    const refreshedAtValue = DateTime.utc().toJSDate().toISOString()

    await repoLoader.insert([
        repoId, repoName, ownerId, ownerLogin, ownerIsOrg, 
        descriptionValue, primaryLanguage || '', license || '', 
        sizeValue, stars || 0, forks || 0, isFork || 0, isArchived || 0, 
        latestReleasedAt, parentRepoId, pushedAt, createdAt, updatedAt, refreshedAtValue
    ]);
} 