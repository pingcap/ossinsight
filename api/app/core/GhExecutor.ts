import {Octokit} from "octokit";
import {createPool, Factory, Pool} from "generic-pool";
import {DateTime} from "luxon";
import consola, {Consola} from "consola";
import {ghQueryCounter, ghQueryTimer, measure} from "../metrics";
import CacheBuilder, { CacheProviderTypes } from "./cache/CacheBuilder";

const GET_REPO_CACHE_HOURS = 1;
const SEARCH_REPOS_CACHE_HOURS = 24;

const SYMBOL_TOKEN = Symbol('PERSONAL_TOKEN')

const RECOMMEND_REPO_LIST_1_KEYWORD = 'recommend-repo-list-1-keyword'
const RECOMMEND_REPO_LIST_1: any[] = [
  { id: 41986369, fullName: 'pingcap/tidb' },
  { id: 10270250, fullName: 'facebook/react' },
  { id: 41881900, fullName: 'microsoft/vscode' },
  { id: 45717250, fullName: 'tensorflow/tensorflow' },
  { id: 1863329, fullName: 'laravel/laravel' },
  { id: 20580498, fullName: 'kubernetes/kubernetes' },
  { id: 60246359, fullName: 'ClickHouse/ClickHouse' },
]

const RECOMMEND_REPO_LIST_2_KEYWORD = 'recommend-repo-list-2-keyword'
const RECOMMEND_REPO_LIST_2: any[] = [
  { id: 48833910, fullName: 'tikv/tikv' },
  { id: 11730342, fullName: 'vuejs/vue' },
  { id: 4164482, fullName: 'django/django' },
  { id: 27193779, fullName: 'nodejs/node' },
  { id: 65600975, fullName: 'pytorch/pytorch' },
  { id: 8514, fullName: 'rails/rails' },
  { id: 16563587, fullName: 'cockroachdb/cockroach' },
]

function eraseToken (value: string | undefined): string {
  return value ? `****${value.substring(value.length - 8)}` : 'anonymous'
}

class OctokitFactory implements Factory<Octokit> {
  private tokens: Set<string | undefined> = new Set()
  private log: Consola

  constructor(tokens: string[]) {
    this.log = consola.withTag('octokit-factory')
    tokens.forEach(token => this.tokens.add(token))
    this.log.info('create with %s tokens', tokens.length)
  }

  async create(): Promise<Octokit> {
    if (this.tokens.size > 0) {
      const {value} = this.tokens.keys().next()
      const erasedToken = eraseToken(value)
      const log = consola.withTag(`octokit:${erasedToken}`)
      this.tokens.delete(value)
      const octokit = new Octokit({auth: value, log })
      Object.defineProperty(octokit, SYMBOL_TOKEN, {value, writable: false, enumerable: false, configurable: false})
      this.log.info('create client with token %s', erasedToken)
      return octokit
    } else {
      return Promise.reject('Out of personal tokens')
    }
  }

  async destroy(client: Octokit): Promise<void> {
    const { value } = Object.getOwnPropertyDescriptor(client, SYMBOL_TOKEN)!
    this.tokens.add(value)
    const erasedToken = eraseToken(value)
    this.log.info('release client with token %s', erasedToken)
  }
}

export default class GhExecutor {
  private octokitPool: Pool<Octokit>

  constructor(
    tokens: string[] = [],
    public readonly cacheBuilder: CacheBuilder
  ) {
    this.octokitPool = createPool(new OctokitFactory(tokens), {
      min: 0,
      max: tokens.length
    })
    this.octokitPool
      .on('factoryCreateError', function (err) {
        console.error('factoryCreateError', err)
      })
      .on('factoryDestroyError', function (err) {
        console.error('factoryDestroyError', err)
      })
  }

  getRepo (owner: string, repo: string) {
    const cacheKey = `gh:get_repo:${owner}_${repo}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.CACHED_TABLE, cacheKey, GET_REPO_CACHE_HOURS, GET_REPO_CACHE_HOURS
    );

    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`get repo ${owner}/${repo}`)
        ghQueryCounter.labels({ api: 'getRepo', phase: 'start' }).inc();

        try {
          const start = DateTime.now();
          const {data} = await measure(
            ghQueryTimer.labels({api: 'getRepo'}),
            () => octokit.rest.repos.get({repo, owner})
          )
          const end = DateTime.now();
          const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!
          ghQueryCounter.labels({api: 'getRepo', phase: 'success'}).inc();

          return {
            requestedAt: start,
            finishedAt: end,
            data: data,
            with: eraseToken(value)
          }
        } catch (e) {
          ghQueryCounter.labels({ api: 'getRepo', phase: 'error' }).inc()
          throw e
        }
      })
    })
  }

  searchRepos(keyword: any) {
    const cacheKey = `gh:search_repos:${keyword}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.CACHED_TABLE, cacheKey, SEARCH_REPOS_CACHE_HOURS, SEARCH_REPOS_CACHE_HOURS
    );

    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`search repos by keyword ${keyword}`)
        const start = DateTime.now();

        // Recommend list.
        if (keyword === RECOMMEND_REPO_LIST_1_KEYWORD) {
          return Promise.resolve({
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: RECOMMEND_REPO_LIST_1
          })
        } else if (keyword === RECOMMEND_REPO_LIST_2_KEYWORD) {
          return Promise.resolve({
            requestedAt: start,
            finishedAt: DateTime.now(),
            data: RECOMMEND_REPO_LIST_2
          })
        }

        const variables = {
          q: keyword,
        }
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

        ghQueryCounter.labels({ api: 'searchRepos', phase: 'start' }).inc()

        try {
          const data: any = await measure(
            ghQueryTimer.labels({api: 'searchRepos'}),
            () => octokit.graphql(query, variables)
          )
          ghQueryCounter.labels({api: 'searchRepos', phase: 'success'}).inc()

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
          ghQueryCounter.labels({ api: 'searchRepos', phase: 'error' }).inc()
          throw e
        }
      })
    })
  }
}
