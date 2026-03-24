/**
 * GitHub Sync Tasks
 *
 * Handles synchronization of GitHub data (users, repos, events)
 */
import type { Orbital } from '@mini256/orbital';
export interface GithubSyncUserData {
    userId: number;
    username: string;
    force?: boolean;
}
export interface GithubSyncRepoData {
    repoId: number;
    owner: string;
    name: string;
    force?: boolean;
}
export interface GithubSyncEventsData {
    since?: string;
    limit?: number;
}
export declare function registerGithubSyncTasks(scheduler: Orbital): void;
//# sourceMappingURL=github-sync.d.ts.map