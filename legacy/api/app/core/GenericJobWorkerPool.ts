import consola, { Consola } from "consola"
import { Factory } from "generic-pool"
import { Octokit } from "octokit"
import { throttling } from "@octokit/plugin-throttling";
import { getConnectionOptions } from "../utils/db";
import { Pool as GenericPool, createPool as createGenericPool } from "generic-pool";
import { createPool, Pool } from "mysql2/promise";

export const CustomOctokit = Octokit.plugin(throttling);
export const SYMBOL_TOKEN = Symbol('PERSONAL_TOKEN');

// Init logger.
const logger = consola.withTag('workers');

export function eraseToken (value: string | undefined): string {
    return value ? `****${value.substring(value.length - 8)}` : 'anonymous';
}

export interface JobWorker<T> {
  logger: Consola;
  pool: Pool;
  octokit: Octokit;
  payload?: T;
}

export type PayloadInitializer<T> = (connPool: Pool) => T;
export type PayloadDestroyer<T> = (payload: T) => void;

export class WorkerFactory<T> implements Factory<JobWorker<T>> {
    private tokens: Array<string | undefined> = [];
    private log: Consola;
  
    constructor(
      tokens: string[],
      readonly payloadInitializer?: PayloadInitializer<T>,
      readonly payloadDestroyer?: PayloadDestroyer<T>
    ) {
      this.log = consola.withTag('worker-factory')
      tokens.forEach(token => this.tokens.push(token))
      this.log.info('Create workers with %s GitHub tokens.', tokens.length)
    }
  
    async create(): Promise<JobWorker<T>> {
      if (this.tokens.length <= 0) {
        throw new Error('Out of GitHub personal tokens.');
      }

      // Get access token.
      const token = this.tokens.pop();
      const erasedToken = eraseToken(token)
      const log = consola.withTag(`worker:${erasedToken}`)

      // Init octokit client.
      const octokit = new CustomOctokit({
        auth: token,
        log,
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
        },
      });

      // Init TiDB client.
      const connPool = createPool(getConnectionOptions({
        connectionLimit: 2
      }));

      // Init worker.
      const worker:JobWorker<T> = {
        logger: log,
        pool: connPool,
        octokit: octokit,
        payload: this.payloadInitializer ? this.payloadInitializer(connPool) : undefined,
      };

      Object.defineProperty(worker, SYMBOL_TOKEN, {value: token, writable: false, enumerable: false, configurable: false});
      this.log.info('Create worker with GitHub token %s.', erasedToken);

      return worker;
    }
  
    async destroy(worker: JobWorker<T>): Promise<void> {
      const { value } = Object.getOwnPropertyDescriptor(worker, SYMBOL_TOKEN)!
      this.tokens.push(value);
      const erasedToken = eraseToken(value);
      this.log.info('Release GitHub client with GitHub token %s.', erasedToken);

      if (this.payloadDestroyer && worker.payload) {
        this.payloadDestroyer(worker.payload);
        this.log.info('Release payload of the worker with GitHub token %s.', erasedToken);
      }

      worker.pool.end();
      this.log.info('Release database connection pool of the worker with GitHub token %s.', erasedToken);
    }
}

export function createWorkerPool<T>(
  tokens: string[], payloadInitializer?: PayloadInitializer<T>, payloadDestroyer?: PayloadDestroyer<T>
): GenericPool<JobWorker<T>> {
  // Notice: every worker has one octokit client.
  const workerPool = createGenericPool(new WorkerFactory<T>(tokens, payloadInitializer, payloadDestroyer), {
      min: 0,
      max: tokens.length
  }).on('factoryCreateError', function (err) {
      logger.error('Failed to create worker: ', err)
  }).on('factoryDestroyError', function (err) {
      logger.error('Failed to destroy worker: ', err)
  });
  return workerPool;
}
