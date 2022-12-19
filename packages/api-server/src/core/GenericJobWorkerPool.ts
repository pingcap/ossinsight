import {createPool as createGenericPool, Factory, Pool as GenericPool} from "generic-pool";
import {Pool} from "mysql2/promise";
import {Octokit} from "@octokit/core";
import {getPool} from "./db/new";
import pino from "pino";
import {getOctokit} from "../utils/octokit";

export const SYMBOL_TOKEN = Symbol('PERSONAL_TOKEN');

export function eraseToken (value: string | undefined): string {
    return value ? `****${value.substring(value.length - 8)}` : 'anonymous';
}

export interface JobWorker<T> {
  logger: pino.Logger;
  pool: Pool;
  octokit: Octokit;
  payload?: T;
}

export type PayloadInitializer<T> = (connPool: Pool) => T;
export type PayloadDestroyer<T> = (payload: T) => void;

export class WorkerFactory<T> implements Factory<JobWorker<T>> {
    private tokens: Array<string | undefined> = [];
  
    constructor(
      tokens: string[],
      readonly log: pino.Logger,
      readonly payloadInitializer?: PayloadInitializer<T>,
      readonly payloadDestroyer?: PayloadDestroyer<T>,
    ) {
      tokens.forEach(token => this.tokens.push(token))
      this.log.info('Create workers with %s GitHub tokens.', tokens.length)
    }
  
    async create(): Promise<JobWorker<T>> {
      if (this.tokens.length <= 0) {
        throw new Error('Out of GitHub personal tokens.');
      }

      // Get access token.
      const token = this.tokens.pop();
      const erasedToken = eraseToken(token);
      const log = this.log.child({ worker: erasedToken });

      // Init octokit client.
      const octokit = getOctokit(token, log);

      // Init TiDB client.
      const connPool =getPool({
        connectionLimit: 2
      });

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
  tokens: string[], logger: pino.Logger, payloadInitializer?: PayloadInitializer<T>, payloadDestroyer?: PayloadDestroyer<T>
): GenericPool<JobWorker<T>> {
  // Notice: every worker has one octokit client.
  return createGenericPool(new WorkerFactory<T>(tokens, logger, payloadInitializer, payloadDestroyer), {
    min: 0,
    max: tokens.length
  }).on('factoryCreateError', function (err) {
    logger.error('Failed to create worker: ', err)
  }).on('factoryDestroyError', function (err) {
    logger.error('Failed to destroy worker: ', err)
  });
}
