import DigestClient from "digest-fetch";
import {FastifyBaseLogger} from "fastify";
import fp from "fastify-plugin";
import {DateTime} from "luxon";
import {countAPIRequest, dataServiceRequestCounter, dataServiceRequestTimer, measure} from "../../../metrics";

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

  async query(endpointPath: string, params: Record<string, any>) {
    const counter = dataServiceRequestCounter;
    const timer = dataServiceRequestTimer.labels({ api: endpointPath });

    return await countAPIRequest(counter, endpointPath, async () => {
      return await measure(timer, async () => {
        const startTime = DateTime.now();
        const res = await this.client.fetch(`${this.baseURL}/${endpointPath}`, {
          params
        });

        const endTime = DateTime.now();
        const duration = endTime.diff(startTime, 'seconds').seconds;
        this.logger.info(`✅ Finished querying ${endpointPath} on TiDB Data Service, cost: ${duration} s.`);
        return res;
      });
    });
  }
}
