import { BatchLoader } from "../../app/core/BatchLoader";
import { GitHubRepo } from "./types";

export async function loadGitHubRepos(repoLoader: BatchLoader, repos: GitHubRepo[]): Promise<number> {
    for (const repo of repos) {
        await loadGitHubRepo(repoLoader, repo);
    }
    return repos.length;
}

export async function loadGitHubRepo(repoLoader: BatchLoader, repo: GitHubRepo) {
    let {
        repoId, repoName, ownerId, ownerLogin, ownerIsOrg, description, primaryLanguage, license, size, stars, forks, 
        isFork, isArchived, latestReleasedAt, parentRepoId, pushedAt, createdAt, updatedAt, 
    } = repo;

    await repoLoader.insert([
        repoId, repoName, ownerId, ownerLogin, ownerIsOrg, description, primaryLanguage, license, size, stars, forks, 
        isFork, isArchived, latestReleasedAt, parentRepoId, pushedAt, createdAt, updatedAt
    ]);
}