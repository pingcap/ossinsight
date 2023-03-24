export interface GitHubRepo {
    repoId: number;
    repoName: string;
    ownerId: number;
    ownerLogin: string;
    ownerIsOrg: number;
    description?: string | null;
    primaryLanguage?: string | null;
    license?: string;
    size?: number;
    stars?: number;
    forks?: number;
    parentRepoId?: number;
    isFork?: boolean;
    isArchived?: boolean;
    isDeleted?: boolean;
    latestReleasedAt?: Date;
    pushedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    lastEventAt?: Date | null;
    refreshedAt?: Date;
}
