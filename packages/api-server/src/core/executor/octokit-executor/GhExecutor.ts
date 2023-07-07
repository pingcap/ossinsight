import CacheBuilder, { CacheProviderTypes } from "../../cache/CacheBuilder";
import { OctokitFactory, SYMBOL_TOKEN, eraseToken } from "./OctokitFactory";
import {Pool, createPool} from "generic-pool";
import { RECOMMEND_REPO_LIST_1_KEYWORD, RECOMMEND_REPO_LIST_2_KEYWORD, RECOMMEND_USER_LIST_KEYWORD, getRecommendRepoList, getRecommendUserList } from "./Recommeneder";
import {githubAPICounter, githubAPITimer, measure} from "../../../metrics";
import {CachedData} from "../../cache/Cache";
import {DateTime} from "luxon";
import {Octokit} from "octokit";
import pino from 'pino';

const GET_REPO_CACHE_HOURS = 1;
const SEARCH_REPOS_CACHE_HOURS = 24;

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

export interface UserSearchParam {
  keyword: string;
  type?: UserType;
}

export default class GhExecutor {
  private octokitPool: Pool<Octokit>

  constructor(
    log: pino.Logger,
    tokens: (string | undefined)[] = [],
    private readonly cacheBuilder: CacheBuilder
  ) {
    const octokitFactory = new OctokitFactory(tokens, log.child({ 'component': 'octokit-factory' }));
    this.octokitPool = createPool(octokitFactory, {
      min: 0,
      max: tokens.length,
    });
    this.octokitPool
      .on('factoryCreateError', function (err) {
        console.error('factoryCreateError', err)
      })
      .on('factoryDestroyError', function (err) {
        console.error('factoryDestroyError', err)
      })
  }

  getRepo(owner: string, repo: string) {
    const cacheKey = `gh:get_repo:${owner}_${repo}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.CACHED_TABLE, cacheKey, GET_REPO_CACHE_HOURS
    );

    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`get repo ${owner}/${repo}`)

        try {
          githubAPICounter.labels({ api: 'getRepo', phase: 'start' }).inc();
          const start = DateTime.now();
          const {data} = await measure(
            githubAPITimer.labels({api: 'getRepo'}),
            async () => await octokit.rest.repos.get({repo, owner})
          )
          const end = DateTime.now();
          githubAPICounter.labels({api: 'getRepo', phase: 'success'}).inc();
          const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!

          return {
            requestedAt: start,
            finishedAt: end,
            data: data,
            with: eraseToken(value)
          }
        } catch (e) {
          githubAPICounter.labels({ api: 'getRepo', phase: 'error' }).inc();
          throw e
        }
      })
    })
  }

  searchRepos(keyword: string):Promise<CachedData<RepoSearchItem>> {
    const cacheKey = `gh:search_repos:${keyword}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.CACHED_TABLE, cacheKey, SEARCH_REPOS_CACHE_HOURS
    );

    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`search repos by keyword ${keyword}`)
        const start = DateTime.now();

        // Recommend list.
        if ([RECOMMEND_REPO_LIST_1_KEYWORD, RECOMMEND_REPO_LIST_2_KEYWORD].includes(keyword)) {
          return Promise.resolve({
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: getRecommendRepoList(keyword)
          })
        }

        const variables = {
          q: keyword,
        }

        // Reference:
        // - https://docs.github.com/en/graphql/reference/queries#searchresultitemconnection
        // - https://docs.github.com/en/graphql/reference/objects#repository
        const query = /* GraphQL */ `
            query searchRepository($q: String!){
                search(query: $q, first: 10, type: REPOSITORY) {
                    codeCount
                    nodes {
                        ...on Repository {
                            databaseId
                            nameWithOwner
                        }
                    }
                }
            }
        `
        let formattedData: any[] = []

        githubAPICounter.labels({ api: 'searchRepos', phase: 'start' }).inc()

        try {
          const data: any = await measure(
            githubAPITimer.labels({api: 'searchRepos'}),
            async () => await octokit.graphql(query, variables)
          )
          githubAPICounter.labels({api: 'searchRepos', phase: 'success'}).inc()

          data.search.nodes.forEach((repo: any) => formattedData.push({
            id: repo.databaseId,
            fullName: repo.nameWithOwner,
          }));

          const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!;
          return {
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: formattedData,
            with: eraseToken(value)
          }
        } catch (e) {
          githubAPICounter.labels({ api: 'searchRepos', phase: 'error' }).inc()
          throw e
        }
      })
    })
  }

  searchUsers(keyword: string, type?: UserType):Promise<CachedData<UserSearchItem>> {
    const cacheKey = `gh:search_users:${keyword}`;
    const cache = this.cacheBuilder.build(
        CacheProviderTypes.CACHED_TABLE, cacheKey, SEARCH_REPOS_CACHE_HOURS
    );

    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`search users by keyword ${keyword}`)
        const start = DateTime.now();

        // Recommend list.
        if (keyword === RECOMMEND_USER_LIST_KEYWORD) {
          return Promise.resolve({
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: getRecommendUserList()
          })
        }

        let q = keyword;
        if (type === UserType.USER) {
          q += ' type:user';
        } else if (type === UserType.ORG) {
          q += ' type:org';
        }

        const variables = {
          q: q,
        }

        // Reference:
        // - https://docs.github.com/en/graphql/reference/queries#searchresultitemconnection
        // - https://docs.github.com/en/graphql/reference/objects#user
        const query = /* GraphQL */ `
          query searchUsers($q: String!){
            search(query: $q, first: 10, type: USER) {
              codeCount
              nodes {
                ...on User {
                  databaseId
                  login
                }
              }
            }
          }
        `
        let formattedData: any[] = []

        githubAPICounter.labels({ api: 'searchUsers', phase: 'start' }).inc()

        try {
          const data: any = await measure(
              githubAPITimer.labels({api: 'searchUsers'}),
              async () => await octokit.graphql(query, variables)
          )
          githubAPICounter.labels({api: 'searchUsers', phase: 'success'}).inc()

          data.search.nodes.forEach((repo: any) => formattedData.push({
            id: repo.databaseId,
            login: repo.login,
          }));

          const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!;
          return {
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: formattedData,
            with: eraseToken(value)
          }
        } catch (e) {
          githubAPICounter.labels({ api: 'searchUsers', phase: 'error' }).inc()
          throw e
        }
      })
    })
  }
}

