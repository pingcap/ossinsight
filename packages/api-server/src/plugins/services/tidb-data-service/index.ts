import Axios, {AxiosInstance} from "axios";
import {
  countAPIRequest,
  dataServiceRequestCounter,
  dataServiceRequestTimer,
  measure
} from "../../../metrics";

import {APIError} from "../../../utils/error";
import {DateTime} from "luxon";
import {FastifyBaseLogger} from "fastify";
import {URLSearchParams} from "url";
import fp from "fastify-plugin";

declare module 'fastify' {
  interface FastifyInstance {
      tidbDataService?: TiDBDataService;
  }
}

export default fp(async (app) => {
  if (app.config.TIDB_CLOUD_DATA_SERVICE_APP_ID) {
    app.decorate('tidbDataService', new TiDBDataService(
      app.log,
      app.config.TIDB_CLOUD_DATA_SERVICE_APP_ID,
      app.config.TIDB_CLOUD_DATA_SERVICE_PUBLIC_KEY,
      app.config.TIDB_CLOUD_DATA_SERVICE_PRIVATE_KEY,
    ));
  }
}, {
  name: '@ossinsight/tidb-data-service',
  dependencies: []
});

export class TiDBDataService {
  private readonly client: AxiosInstance;

  constructor(
    readonly logger: FastifyBaseLogger,
    appId: string,
    publicKey: string,
    privateKey: string,
  ) {
    const token = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
    this.client = Axios.create({
      baseURL: `https://data.tidbcloud.com/api/v1beta/app/${appId}/endpoint`,
      headers: {
        'Authorization': `Basic ${token}`
      }
    });
  }

  async request(targetURL: string) {
    new URLSearchParams()
    const endpointName = new URL(targetURL, 'https://example.org').pathname;
    if (!endpointName) {
      throw new APIError(400, 'Invalid query name.');
    }

    const counter = dataServiceRequestCounter;
    const timer = dataServiceRequestTimer.labels({ api: endpointName });

    return await countAPIRequest(counter, endpointName, async () => {
      return await measure(timer, async () => {
        const startTime = DateTime.now();
        let res;
        try {
          res = await this.client.get(targetURL);
        } catch (err) {
          // A 404 from Data Service means that endpoint NAME does not exist
          // there. It never means "no matching rows" - a valid endpoint with
          // no data answers 200 with an empty `rows` array. Several paths are
          // registered in this server without a Data Service counterpart, and
          // routes/v1/index.ts forwards any unmatched /v1 path verbatim, so
          // without this every unknown path surfaced as 500 through the
          // generic error handler in app.ts and looked like an outage.
          // Measured 2026-09-07: ~600/day, all on /v1/repos/{owner}/{repo},
          // /v1/repos/{owner}/{repo}/stargazers/monthly and
          // /v1/collections/{id} - three paths this API never implemented.
          if (Axios.isAxiosError(err) && err.response?.status === 404) {
            throw new APIError(
              404,
              `No such API endpoint: ${endpointName}. See https://api.ossinsight.io/docs/json for the endpoints this API serves.`,
              err as Error
            );
          }
          throw err;
        }
        const endTime = DateTime.now();
        const duration = endTime.diff(startTime, 'seconds').seconds;
        this.logger.info({
          targetURL,
          endpointName,
        }, `✅ Finished request to TiDB Data Service (endpoint: ${endpointName}), cost: ${duration} s.`);
        return res;
      });
    });
  }
}
