import {Octokit} from "octokit";
import {createPool, Factory, Pool} from "generic-pool";
import Cache from './Cache'
import {DateTime} from "luxon";
import consola, {Consola} from "consola";
import {RedisClientType, RedisDefaultModules, RedisModules, RedisScripts} from "redis";
import {ghQueryCounter, ghQueryTimer, measure} from "../metrics";

const SYMBOL_TOKEN = Symbol('PERSONAL_TOKEN')

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
    public readonly redisClient: RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>
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
    const GET_REPO_CACHE_HOURS = 1;
    const key = `gh:get_repo:${owner}_${repo}`;
    const cache = new Cache(this.redisClient, key, GET_REPO_CACHE_HOURS, -1)
    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`get repo ${owner}/${repo}`)
        ghQueryCounter.labels({ api: 'getRepo', phase: 'start' }).inc()
        try {
          const {data} = await measure(
            ghQueryTimer.labels({api: 'getRepo'}),
            () => octokit.rest.repos.get({repo, owner})
          )
          const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!
          ghQueryCounter.labels({api: 'getRepo', phase: 'success'}).inc()
          return {
            expiresAt: DateTime.now().plus({hours: GET_REPO_CACHE_HOURS}),
            data,
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
    const SEARCH_REPOS_CACHE_HOURS = 24;
    const key = `gh:search_repos:${keyword}`;
    const cache = new Cache(this.redisClient, key, SEARCH_REPOS_CACHE_HOURS, -1)
    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`search repos by keyword ${keyword}`)

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

          const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!
          return {
            expiresAt: DateTime.now().plus({hours: SEARCH_REPOS_CACHE_HOURS}),
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
