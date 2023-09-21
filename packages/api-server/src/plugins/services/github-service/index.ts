import fp from "fastify-plugin";
import "./index";
import fs from "fs";
import {DateTime} from "luxon";
import path from "path";
import pino from "pino";
import {CacheProviderTypes} from "../../../core/cache/CacheBuilder";
import OctokitExecutor from "../../../core/executor/octokit-executor/OctokitExecutor";
import {CacheBuilder} from "../../../index";
import Logger = pino.Logger;

export const RECOMMEND_REPO_LIST_1_KEYWORD = 'recommend-repo-list-1-keyword';
export const RECOMMEND_REPO_LIST_2_KEYWORD = 'recommend-repo-list-2-keyword';
export const RECOMMEND_USER_LIST_KEYWORD = 'recommend-user-list-keyword';
export const RECOMMEND_ORG_LIST_KEYWORD = 'recommend-org-list-keyword';

declare module 'fastify' {
  interface FastifyInstance {
    githubService: GithubService;
  }
}

export interface UserSearchItem {
  id: number;
  login: string;
}

export interface RepoSearchItem {
  id: number;
  fullName: string;
}

export enum UserType {
  USER = 'user',
  ORG = 'org'
}

export default fp(async (app) => {
  const log = app.log.child({ 'component': 'github-service' });
  app.decorate('githubService', new GithubService(
    log as Logger,
    app.octokitExecutor,
    app.cacheBuilder,
    app.config.CONFIGS_PATH
  ));
}, {
  name: '@ossinsight/github-service',
  dependencies: [
    '@ossinsight/octokit-executor',
    '@ossinsight/cache-builder',
  ]
});

export class GithubService {
  private readonly DEFAULT_RECOMMEND_USER_LIST: UserSearchItem[];
  private readonly DEFAULT_RECOMMEND_ORG_LIST: UserSearchItem[];
  private readonly DEFAULT_RECOMMEND_REPO_LIST_1: RepoSearchItem[];
  private readonly DEFAULT_RECOMMEND_REPO_LIST_2: RepoSearchItem[];
  private readonly GET_NODE_CACHE_HOURS = 1;
  private readonly SEARCH_NODES_CACHE_HOURS = 1;

  // Reference:
  // - https://docs.github.com/en/graphql/reference/queries#searchresultitemconnection
  // - https://docs.github.com/en/graphql/reference/objects#repository
  private readonly SEARCH_REPOS_GQL = `
    query searchRepository($q: String!){
        search(query: $q, first: 10, type: REPOSITORY) {
            nodes {
                ...on Repository {
                    id: databaseId 
                    fullName: nameWithOwner 
                    defaultBranchRef {
                      name
                    }
                }
            }
        }
    }
  `;

  // Reference:
  // - https://docs.github.com/en/graphql/reference/queries#searchresultitemconnection
  // - https://docs.github.com/en/graphql/reference/objects#user
  private readonly SEARCH_USERS_GQL = `
    query searchRepository($q: String!){
        search(query: $q, first: 10, type: USER) {
            nodes {
                ...on User {
                    id: databaseId,
                    login
                }
                ...on Organization {
                    id: databaseId,
                    login
                }
            }
        }
    }
  `;

  constructor(
    readonly logger: Logger,
    readonly octokitExecutor: OctokitExecutor,
    readonly cacheBuilder: CacheBuilder,
    readonly configsPath: string
  ) {
    const recommendRepos1File = path.join(this.configsPath, 'search/recommend/repos/list-1.json');
    this.DEFAULT_RECOMMEND_REPO_LIST_1 = this.loadRecommendReposFromFile(recommendRepos1File);

    const recommendRepos2File = path.join(this.configsPath, 'search/recommend/repos/list-2.json');
    this.DEFAULT_RECOMMEND_REPO_LIST_2 = this.loadRecommendReposFromFile(recommendRepos2File);

    const recommendUsersFile = path.join(this.configsPath, 'search/recommend/users/list.json');
    this.DEFAULT_RECOMMEND_USER_LIST = this.loadRecommendUsersFromFile(recommendUsersFile);

    const recommendOrgsFile = path.join(this.configsPath, 'search/recommend/orgs/list.json');
    this.DEFAULT_RECOMMEND_ORG_LIST = this.loadRecommendOrgsFromFile(recommendOrgsFile);
  }

  private loadRecommendReposFromFile(filePath: string): RepoSearchItem[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (err) {
      throw new Error(`Failed to parse the recommend repos from file (path: ${filePath}).`, {
        cause: err
      });
    }
  }

  private loadRecommendUsersFromFile(filePath: string): UserSearchItem[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (err) {
      throw new Error(`Failed to parse the recommend users from file (path: ${filePath}).`, {
        cause: err
      });
    }
  }

  private loadRecommendOrgsFromFile(filePath: string): UserSearchItem[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (err) {
      throw new Error(`Failed to parse the recommend orgs from file (path: ${filePath}).`, {
        cause: err
      });
    }
  }

  async getRepoByID(id: number) {
    const apiLabel = "get_repo_by_id";
    const cacheKey = `gh:${apiLabel}:${id}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.NORMAL_TABLE, cacheKey, this.GET_NODE_CACHE_HOURS
    );

    return cache.load(async () => {
      return await this.octokitExecutor.request(apiLabel, async (octokit) => {
        return await octokit.request('GET /repositories/{id}', {
          id
        });
      });
    });
  }

  async getRepoByName(owner: string, repo: string) {
    const apiLabel = "get_repo_by_name";
    const cacheKey = `gh:${apiLabel}:${owner}_${repo}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.NORMAL_TABLE, cacheKey, this.GET_NODE_CACHE_HOURS
    );

    return cache.load(async () => {
      return await this.octokitExecutor.request(apiLabel, async (octokit) => {
        return await octokit.rest.repos.get({
          owner,
          repo
        });
      });
    });
  }

  async getUserByID(id: number) {
    const apiLabel = "get_user_by_id";
    const cacheKey = `gh:${apiLabel}:${id}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.NORMAL_TABLE, cacheKey, this.GET_NODE_CACHE_HOURS
    );

    return cache.load(async () => {
      return await this.octokitExecutor.request(apiLabel, async (octokit) => {
        return await octokit.request('GET /user/{id}', {
          id
        });
      });
    });
  }

  async getOrganizationByID(id: number) {
    const apiLabel = "get_organization_by_id";
    const cacheKey = `gh:${apiLabel}:${id}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.NORMAL_TABLE, cacheKey, this.GET_NODE_CACHE_HOURS
    );

    return cache.load(async () => {
      return await this.octokitExecutor.request(apiLabel, async (octokit) => {
        return await octokit.request('GET /organizations/{id}', {
          id
        });
      });
    });
  }

  async getUserByUsername(username: string) {
    const apiLabel = "get_user_by_username";
    const cacheKey = `gh:${apiLabel}:${username}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.NORMAL_TABLE, cacheKey, this.GET_NODE_CACHE_HOURS
    );

    return cache.load(async () => {
      return await this.octokitExecutor.request(apiLabel, async (octokit) => {
        return await octokit.rest.users.getByUsername({
          username
        });
      });
    });
  }

  async searchRepos(keyword: string) {
    keyword = keyword.replaceAll('  ', ' ');
    if ([RECOMMEND_REPO_LIST_1_KEYWORD, RECOMMEND_REPO_LIST_2_KEYWORD].includes(keyword)) {
      return this.getRecommendRepos(keyword);
    }

    const apiLabel = "search_repos";
    const cacheKey = `gh:${apiLabel}:${keyword}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.NORMAL_TABLE, cacheKey, this.SEARCH_NODES_CACHE_HOURS
    );

    return cache.load(async () => {
      const variables = {
        q: keyword
      };

      return await this.octokitExecutor.graphql(apiLabel, this.SEARCH_REPOS_GQL, variables, (res) => {
        return res?.search?.nodes || [];
      });
    });
  }

  async searchUsers(keyword: string, type: UserType) {
    // By default, select from GitHub stars:
    // https://stars.github.com/profiles/?contributionType=OPEN_SOURCE_PROJECT
    if (type === UserType.USER && keyword === RECOMMEND_USER_LIST_KEYWORD) {
      return {
        requestedAt: DateTime.now(),
        finishedAt: DateTime.now(),
        data: this.randomSelectFromList(this.DEFAULT_RECOMMEND_USER_LIST, 10)
      };
    }

    if (type === UserType.ORG && keyword === RECOMMEND_ORG_LIST_KEYWORD) {
      return {
        requestedAt: DateTime.now(),
        finishedAt: DateTime.now(),
        data: this.randomSelectFromList(this.DEFAULT_RECOMMEND_ORG_LIST, 10)
      };
    }

    const apiLabel = `search_${type}s`;
    const cacheKey = `gh:${apiLabel}:${keyword}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.NORMAL_TABLE, cacheKey, this.SEARCH_NODES_CACHE_HOURS
    );

    return cache.load(async () => {
      const variables = {
        q: `${keyword} ${type ? `type:${type}` : ''}`,
      };

      return await this.octokitExecutor.graphql(apiLabel, this.SEARCH_USERS_GQL, variables, (res) => {
        return res?.search?.nodes || [];
      });
    });
  }

  async getRecommendRepos(keyword: string) {
    let repos: RepoSearchItem[] = [];
    if (keyword === RECOMMEND_REPO_LIST_1_KEYWORD) {
      repos = this.DEFAULT_RECOMMEND_REPO_LIST_1;
    } else if (keyword === RECOMMEND_REPO_LIST_2_KEYWORD) {
      repos = this.DEFAULT_RECOMMEND_REPO_LIST_2;
    }

    return {
      requestedAt: DateTime.now(),
      finishedAt: DateTime.now(),
      data: repos
    };
  }

  private randomSelectFromList(list: Array<any>, n: number) {
    if (!Array.isArray(list)) return [];

    if (list.length < n) {
      return list;
    }

    const result = new Set();
    while (result.size < n) {
      const index =  Math.floor(Math.random() * list.length);
      result.add(list[index])
    }

    return Array.from(result);
  }

}


