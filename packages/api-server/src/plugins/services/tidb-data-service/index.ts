import DigestClient from "digest-fetch";
import {FastifyBaseLogger} from "fastify";
import fp from "fastify-plugin";
import {DateTime} from "luxon";
import {URLSearchParams} from "url";
import {countAPIRequest, dataServiceRequestCounter, dataServiceRequestTimer, measure} from "../../../metrics";
import {APIError} from "../../../utils/error";

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
  private readonly client: DigestClient;
  private readonly baseURL: string;

  constructor(
    readonly logger: FastifyBaseLogger,
    appId: string,
    publicKey: string,
    privateKey: string,
  ) {
    this.client = new DigestClient(publicKey, privateKey);
    this.baseURL = `https://data.tidbcloud.com/api/v1beta/app/${appId}/endpoint`;
  }

  async request(originalPath: string) {
    new URLSearchParams()
    const endpointName = new URL(originalPath, 'https://example.org').pathname;
    if (!endpointName) {
      throw new APIError(400, 'Invalid query name.');
    }

    const counter = dataServiceRequestCounter;
    const timer = dataServiceRequestTimer.labels({ api: endpointName });

    return await countAPIRequest(counter, endpointName, async () => {
      return await measure(timer, async () => {
        const startTime = DateTime.now();
        const res = await this.client.fetch(`${this.baseURL}${originalPath}`);
        const endTime = DateTime.now();
        const duration = endTime.diff(startTime, 'seconds').seconds;
        this.logger.info(`✅ Finished request TiDB Data Service (endpoint: ${endpointName}), cost: ${duration} s.`);
        return res;
      });
    });
  }
}
