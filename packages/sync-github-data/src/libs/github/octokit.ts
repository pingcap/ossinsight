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
const SYMBOL_DEAD = Symbol('DEAD_CREDENTIAL');

/**
 * GitHub refuses a suspended account or a revoked token on every request,
 * forever, with a 403 that carries no rate-limit headers. The throttling
 * plugin therefore does not retry it, but nothing removed the worker either:
 * it stayed in rotation and every time range it drew failed and was logged
 * as if transient. Measured 2026-09-01: half of this job's tokens were
 * suspended accounts and it had been drawing them for months.
 */
function isDeadCredential(error: any): boolean {
  const status = Number(error?.status);
  if (status === 401) {
    return true;
  }
  return status === 403 && /suspended/i.test(String(error?.message ?? ''));
}

export function eraseToken(value: string | undefined): string {
  return value ? `****${value.substring(value.length - 8)}` : 'anonymous';
}

export class OctokitFactory<T> implements Factory<Octokit> {
  private tokens: Array<string | undefined> = [];
  private readonly total: number;
  /** Tokens GitHub has rejected outright; never handed out again. */
  private readonly dead = new Set<string | undefined>();

  constructor(
    tokens: string[],
    readonly logger: pino.Logger
  ) {
    tokens.forEach(token => this.tokens.push(token))
    this.total = tokens.length;
    this.logger.info('Create workers with %s GitHub tokens.', tokens.length)
  }

  async create(): Promise<Octokit> {
    if (this.tokens.length <= 0) {
      if (this.dead.size >= this.total) {
        this.logger.fatal('All %d GitHub tokens were rejected by GitHub (suspended or revoked); nothing can be synced until they are replaced.', this.total);
        process.exit(1);
      }
      // Every remaining token is bound to a live worker. Throwing here would
      // make generic-pool dispense again at once and spin on the failure; a
      // promise that never settles keeps this slot pending instead, which is
      // exactly the reduced concurrency wanted after losing a credential.
      this.logger.warn('No spare GitHub token (%d of %d quarantined); continuing with fewer workers.', this.dead.size, this.total);
      return new Promise<Octokit>(() => {});
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

    // Registered after the plugins, so this is the outermost error hook and
    // sees the error the throttling and retry plugins gave up on.
    octokit.hook.error('request', (error: any) => {
      if (isDeadCredential(error) && !this.dead.has(token)) {
        this.dead.add(token);
        Object.defineProperty(octokit, SYMBOL_DEAD, {value: true, enumerable: false});
        log.error('GitHub rejected this credential (%s); quarantining it for the rest of the run, %d of %d tokens left.',
          error?.message, this.total - this.dead.size, this.total);
        if (this.dead.size >= this.total) {
          // Every waiter would otherwise block on a create() that never
          // settles and the process would sit idle looking healthy. Die
          // loudly instead so pm2 shows it errored.
          this.logger.fatal('All %d GitHub tokens were rejected by GitHub (suspended or revoked); nothing can be synced until they are replaced.', this.total);
          process.exit(1);
        }
      }
      throw error;
    });

    return octokit;
  }

  /** Called on every borrow (testOnBorrow); a quarantined client is destroyed instead of handed out. */
  async validate(octokit: Octokit): Promise<boolean> {
    return !(octokit as any)[SYMBOL_DEAD];
  }

  async destroy(octokit: Octokit): Promise<void> {
    const {value} = Object.getOwnPropertyDescriptor(octokit, SYMBOL_TOKEN)!
    if (this.dead.has(value)) {
      octokit.log.warn('Dropping quarantined GitHub client; its token will not be reused.');
      return;
    }
    this.tokens.push(value);
    octokit.log.info('Release GitHub client.');
  }
}

export function createOctokitPool<T>(logger: pino.Logger, tokens: string[]): GenericPool<Octokit> {
  return createGenericPool(new OctokitFactory<T>(tokens, logger), {
    min: 0,
    max: tokens.length,
    testOnBorrow: true
  }).on('factoryCreateError', function (err) {
    logger.error('Failed to create worker: ', err)
  }).on('factoryDestroyError', function (err) {
    logger.error('Failed to destroy worker: ', err)
  });
}