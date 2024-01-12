import { Factory } from "generic-pool";
import { Octokit } from "octokit";
import pino from 'pino';
import {createOctokitClient, getOctokitToken} from "../../../utils/octokit";

export class OctokitFactory implements Factory<Octokit> {
    private tokens: Set<string | undefined> = new Set()

    constructor(tokens: (string | undefined)[], readonly log: pino.Logger) {
      if (tokens.length === 0) {
        this.tokens.add(undefined);
      }
      tokens.forEach(token => this.tokens.add(token));
      this.log.info('Init Octokit factory with %d tokens.', tokens.length);
    }
  
    async create(): Promise<Octokit> {
      if (this.tokens.size <= 0) {
        return Promise.reject('Out of use of GitHub personal access tokens.')
      }

      const {value: token} = this.tokens.keys().next();
      this.tokens.delete(token);
      const octokit = createOctokitClient(this.log, token);
      octokit.log.info('Initialized Octokit client');

      return octokit
    }
  
    async destroy(octokit: Octokit): Promise<void> {
      const token = getOctokitToken(octokit);
      this.tokens.add(token);
      octokit.log.info('Released Octokit client.');
    }
}