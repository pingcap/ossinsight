export enum GitHubUserType {
  ORG = 'ORG',
  USR = 'USR',
  UNKNOWN = 'N/A'
}

export interface RegionCodeMapping {
  region_code: string;
  country_code: string;
}

export enum OrganizationType {
  INDIVIDUAL = 'IND',
  UNKNOWN = 'N/A',
  COMPANY = 'COM',
  FOUNDATION = 'FDN',
  EDUCATION = 'EDU',
}

export interface Organization {
  name: string;
  full_name: string;
  type: OrganizationType;
  description: string;
  patterns: string[];
  domains: string[];
}

export const BOT_LOGIN_REGEXP = /^(bot-.+|.+bot|.+\[bot\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+)$/i;

export interface GitHubRepoNode {
  databaseId: number;
  owner: {
    databaseId: number;
    login: string;
    __typename: "User" | "Organization";
  };
  nameWithOwner: string;
  licenseInfo: {
    key: string;
  } | null;
  isInOrganization: boolean;
  isFork: boolean;
  isArchived: boolean;
  description: string | null;
  primaryLanguage: {
    name: string;
  } | null;
  diskUsage: number | null;
  stargazerCount: number;
  forkCount: number;
  latestRelease: {
    createdAt: string;
  } | null;
  pushedAt: string | null;
  createdAt: string;
  updatedAt: string;
  languages: {
    edges: {
      node: {
        name: string;
      };
      size: number;
    }[];
  };
  repositoryTopics: {
    nodes: {
      topic: {
        name: string;
      };
    }[];
  };
  parent: {
    databaseId: number;
  } | null;
}

export interface GitHubUserNode {
  databaseId: number;
  __typename: 'User' | 'Organization';
  login: string;
  name: string | null;
  email: string | null;
  company: string | null;
  location: string | null;
  repositories: {
    totalCount: number;
  };
  followers: {
    totalCount: number;
  };
  following: {
    totalCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GitHubOrganizationNode {
  databaseId: number;
  __typename: "Organization";
  login: string;
  name: string | null;
  orgEmail: string | null;
  location: string | null;
  repositories: {
    totalCount: number;
  };
  createdAt: string;
  updatedAt: string;
}