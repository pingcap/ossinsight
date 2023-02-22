import {createPool, Factory, Pool} from "generic-pool";
import pino, {Logger} from "pino";
import {eraseGitHubToken} from "./utils";
import {Octokit} from "octokit";

export const TOKEN_SYMBOL = Symbol('PERSONAL_TOKEN');

export {extractOwnerAndRepo} from './utils';

export const initOctokit = (baseLogger: pino.Logger, token: string | undefined): Octokit => {
  const logger = baseLogger.child({"octokit-token": eraseGitHubToken(token)});
  const octokit = new Octokit({
    auth: token,
    log: {
      debug: logger.debug.bind(logger),
      info: logger.info.bind(logger),
      warn: logger.warn.bind(logger),
      error: logger.error.bind(logger),
    },
  });

  Object.defineProperty(octokit, TOKEN_SYMBOL, {
    value: token,
    writable: false,
    enumerable: false,
    configurable: false
  });

  return octokit;
}

export const validateOctokit = async (baseLogger: pino.Logger, octokit: Octokit, requiredScopes: string[]): Promise<boolean> => {
  const descriptor = Object.getOwnPropertyDescriptor(octokit, TOKEN_SYMBOL)!;
  const token = descriptor ? descriptor.value : undefined;
  const logger = baseLogger.child({"octokit-token": eraseGitHubToken(token)});

  const res = await octokit.rest.users.getAuthenticated();
  const scopes = res.headers['x-oauth-scopes']?.split(',').map((s) => s.trim()).filter((s) => s.length > 0) || [];
  const missingScopes = requiredScopes.filter((s) => !scopes.includes(s));
  if (missingScopes.length === 0) {
    return true;
  } else {
    logger.error('Token does not have required scope %s.', missingScopes);
    return false;
  }
}

export class OctokitFactory implements Factory<Octokit> {
  private readonly logger: Logger;
  private clients: Array<Octokit> = [];

  constructor(baseLogger: Logger, readonly tokens: string[] = [], readonly requiredScopes: string[] = []) {
    this.logger = baseLogger.child({'component': 'octokit-factory'});
    this.logger.info('Create octokit factory with %d tokens.', tokens.length);
    this.tokens.forEach(async (token) => {
      const octokit = initOctokit(baseLogger, token);

      if (Array.isArray(requiredScopes) && requiredScopes.length > 0) {
        await validateOctokit(baseLogger, octokit, requiredScopes);
      }

      this.clients.push(octokit);
    });
  }

  async create(): Promise<Octokit> {
    if (this.clients.length === 0) {
      return Promise.reject('No Octokit client available.');
    }

    const client = this.clients.pop();
    if (!client) {
      return Promise.reject('No Octokit client available.');
    }

    client.log.info("Acquired octokit client.");
    return client;
  }

  async destroy(client: Octokit): Promise<void> {
    this.clients.push(client);
    client.log.info("Released octokit client.");
  }

}

export const createOctokitPool = (baseLogger: pino.Logger, tokens: string[], requiredScopes?: string[]): Pool<Octokit> => {
  const logger = baseLogger.child({'component': 'octokit-pool'});
  const octokitFactory = new OctokitFactory(baseLogger, tokens, requiredScopes);
  const octokitPool = createPool(octokitFactory, {
    min: 0,
    max: tokens.length
  });

  octokitPool.on('factoryCreateError', function (err) {
    logger.error(err, 'Failed to create a new octokit client.');
  }).on('factoryDestroyError', function (err) {
    logger.error(err, 'Failed to destroy an octokit client.');
  });

  return octokitPool;
}
