import consola, { Consola } from "consola"
import { Factory } from "generic-pool"
import { Octokit } from "octokit"

export const SYMBOL_TOKEN = Symbol('PERSONAL_TOKEN')

export function eraseToken (value: string | undefined): string {
    return value ? `****${value.substring(value.length - 8)}` : 'anonymous';
}

export class OctokitFactory implements Factory<Octokit> {
    private tokens: Set<string | undefined> = new Set()
    private log: Consola;
  
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