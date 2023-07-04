import DigestClient from "digest-fetch";
import fp from "fastify-plugin";

declare module 'fastify' {
  interface FastifyInstance {
      tidbDataService?: TiDBDataService;
  }
}

export default fp(async (app) => {
  if (app.config.TIDB_CLOUD_DATA_SERVICE_APP_ID) {
    app.decorate('tidbDataService', new TiDBDataService(
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
    appId: string,
    publicKey: string,
    privateKey: string,
  ) {
    this.client = new DigestClient(publicKey, privateKey);
    this.baseURL = `https://data.tidbcloud.com/api/v1beta/app/${appId}/endpoint`;
  }

  async query(endpointPath: string, params: Record<string, any>) {
    return await this.client.fetch(`${this.baseURL}/${endpointPath}`, {
      params
    });
  }

}
