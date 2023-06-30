import {createPool as createGenericPool, Factory, Pool as GenericPool} from "generic-pool";
import {Octokit} from "octokit";
import pino from "pino";

export function getOctokit(token: string | undefined, log: pino.BaseLogger): Octokit {
  if (!token) {
    log.warn('No GitHub personal token provided. Using anonymous GitHub client.');
  }

  return new Octokit({
    auth: token,
    log: {
      debug: log.debug.bind(log),
      info: log.info.bind(log),
      warn: log.warn.bind(log),
      error: log.error.bind(log),
    },
    throttle: {
      onRateLimit: (retryAfter: number, options: any, octokit: Octokit) => {
        octokit.log.warn(
          `Request quota exhausted for request ${options.method} ${options.url}`
        );

        if (options.request.retryCount <= 1) {
          // only retries once
          octokit.log.info(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
      onSecondaryRateLimit: (retryAfter: number, options: any, octokit: Octokit) => {
        octokit.log.warn(
          `SecondaryRateLimit detected for request ${options.method} ${options.url}`
        );

        if (options.request.retryCount <= 1) {
          // only retries once
          octokit.log.info(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
    }
  })
}

export const SYMBOL_TOKEN = Symbol('PERSONAL_TOKEN');

export function eraseToken(value: string | undefined): string {
  return value ? `****${value.substring(value.length - 8)}` : 'anonymous';
}

export class OctokitFactory<T> implements Factory<Octokit> {
  private tokens: Array<string | undefined> = [];

  constructor(
    tokens: string[],
    readonly logger: pino.Logger
  ) {
    tokens.forEach(token => this.tokens.push(token))
    this.logger.info('Create workers with %s GitHub tokens.', tokens.length)
  }

  async create(): Promise<Octokit> {
    if (this.tokens.length <= 0) {
      throw new Error('Out of GitHub personal tokens.');
    }

    // Get access token.
    const token = this.tokens.pop();
    const erasedToken = eraseToken(token);

    // Init Octokit client.
    const log = this.logger.child({worker: erasedToken});
    const octokit = getOctokit(token, log);
    log.info('Init GitHub Client.');

    // Bind token to Octokit instance.
    Object.defineProperty(octokit, SYMBOL_TOKEN, {
      value: token,
      writable: false,
      enumerable: false,
      configurable: false
    });

    return octokit;
  }

  async destroy(octokit: Octokit): Promise<void> {
    const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!
    this.tokens.push(value);
    octokit.log.info('Release GitHub client.');
  }
}

export function createOctokitPool<T>(logger: pino.Logger, tokens: string[]): GenericPool<Octokit> {
  return createGenericPool(new OctokitFactory<T>(tokens, logger), {
    min: 0,
    max: tokens.length
  }).on('factoryCreateError', function (err) {
    logger.error('Failed to create worker: ', err)
  }).on('factoryDestroyError', function (err) {
    logger.error('Failed to destroy worker: ', err)
  });
}