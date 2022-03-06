import {Octokit} from "octokit";
import {createPool, Factory, Pool} from "generic-pool";
import Cache from './Cache'
import {DateTime} from "luxon";
import consola, {Consola} from "consola";
import {RedisClientType, RedisDefaultModules, RedisModules, RedisScripts} from "redis";

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
    // TODO: global config
    const GET_REPO_CACHE_MINUTES = 2
    const key = `gh:get_repo:${owner}_${repo}`;
    const cache = new Cache(key, GET_REPO_CACHE_MINUTES * 60, this.redisClient)
    return cache.load(() => {
      return this.octokitPool.use(async (octokit) => {
        octokit.log.info(`get repo ${owner}/${repo}`)
        const {data} = await octokit.rest.repos.get({repo, owner})
        const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!
        return {
          expiresAt: DateTime.now().plus({minute: GET_REPO_CACHE_MINUTES}),
          data,
          with: eraseToken(value)
        }
      })
    })
  }

  searchRepos(keyword: any) {
    const SEARCH_REPOS_CACHE_MINUTES = 2;
    const key = `gh:search_repos:${keyword}`;
    const cache = new Cache(key, SEARCH_REPOS_CACHE_MINUTES * 60, this.redisClient)
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
                            nameWithOwner
                        }
                    }
                }
            }
        `
        let formattedData: any[] = []

        const data: any = await octokit.graphql(query, variables)
        data.search.nodes.forEach((repo: any) => formattedData.push({
          fullName: repo.nameWithOwner
        }));

        const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!
        return {
          expiresAt: DateTime.now().plus({minute: SEARCH_REPOS_CACHE_MINUTES}),
          data: formattedData,
          with: eraseToken(value)
        }
      })
    })
  }
}
