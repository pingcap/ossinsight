import {Octokit} from "octokit";
import {createPool, Factory, Pool} from "generic-pool";
import Cache from './Cache'
import path from 'path'
import {DateTime} from "luxon";
import consola, { Consola } from "consola";

const SYMBOL_TOKEN = Symbol('PERSONAL_TOKEN')

function eraseToken (value: string | undefined): string {
  return value ? `****${value.substring(value.length - 8)}` : 'anonymous'

}

class OctokitFactory implements Factory<Octokit> {
  private tokens: Set<string | undefined> = new Set()
  private log: Consola

  constructor(tokens: string[]) {
    this.tokens.add(undefined) // no token
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

  constructor(tokens: string[] = []) {
    this.octokitPool = createPool(new OctokitFactory(tokens), {
      min: tokens.length + 1,
      max: tokens.length + 1
    })
  }

  getRepo (owner: string, repo: string) {
    // TODO: global config
    const GET_REPO_CACHE_MINUTES = 2
    const cache = new Cache(path.join(process.cwd(), 'gh', '.cache', owner, `${repo}.json`))
    return cache.load(async () => {
      const octokit = await this.octokitPool.acquire()
      try {
        octokit.log.info(`request repo ${owner}/${repo}`)
        const {data} = await octokit.rest.repos.get({repo, owner})
        const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!
        return {
          expiresAt: DateTime.now().plus({minute: GET_REPO_CACHE_MINUTES}),
          data,
          with: eraseToken(value)
        }
      } finally {
        await this.octokitPool.release(octokit)
      }
    })
  }
}