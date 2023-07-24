import {getOctokitToken} from "../../../utils/octokit";
import { OctokitFactory } from "./OctokitFactory";
import {Pool, createPool} from "generic-pool";
import {countAPIRequest, githubAPICounter, githubAPITimer, measure} from "../../../metrics";
import {DateTime} from "luxon";
import {Octokit} from "octokit";
import pino from 'pino';

export default class OctokitExecutor {
  private octokitPool: Pool<Octokit>

  constructor(
    log: pino.Logger,
    tokens: (string | undefined)[] = []
  ) {
    const octokitFactory = new OctokitFactory(tokens, log.child({ 'component': 'octokit-factory' }));
    this.octokitPool = createPool(octokitFactory, {
      min: 0,
      max: tokens.length,
    });
    this.octokitPool
      .on('factoryCreateError', function (err) {
        log.error(err, 'Failed to create GitHub Client in the octokit factory.', )
      })
      .on('factoryDestroyError', function (err) {
        log.error(err, 'Failed to destroy GitHub Client in the octokit factory.', )
      });
  }

  async request(label: string, action: (octokit: Octokit) => Promise<any>) {
    const octokit = await this.octokitPool.acquire();
    try {
      const start = DateTime.now();
      const {data} = await countAPIRequest(githubAPICounter, label, async () => {
        return await measure(githubAPITimer.labels({api: label}), async () => await action(octokit));
      });
      const end = DateTime.now();
      const duration = end.diff(start).as('seconds');
      octokit.log.info(`Finished GitHub request (api: ${label}) in ${duration}s.`)

      return {
        requestedAt: start,
        finishedAt: end,
        data: data,
        with: getOctokitToken(octokit)
      }
    } catch (err: any) {
      throw new Error(`Failed to execute GitHub request (api: ${label}): ${err.message}`, {
        cause: err,
      });
    } finally {
      await this.octokitPool.release(octokit);
    }
  }

}
