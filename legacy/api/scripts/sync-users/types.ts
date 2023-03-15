export enum GitHubUserType {
    ORG = 'ORG',
    USR = 'USR',
    UNKNOWN = 'N/A'
}

export interface RegionCodeMapping {
    region_code: string;
    country_code: string;
}

export interface GitHubUser {
    id: number;
    login: string;
    type: GitHubUserType;
    is_bot?: boolean;
    name?: string | null;
    email?: string | null;
    organization?: string;
    organization_formatted?: string;
    address?: string;
    country_code?: string;
    region_code?: string;
    state?: string;
    city?: string;
    longitude?: number;
    latitude?: number;
    public_repos: number;
    followers: number;
    following: number;
    createdAt: Date;
    updatedAt: Date;
    deleted?: boolean;
    refreshedAt?: Date;
}
