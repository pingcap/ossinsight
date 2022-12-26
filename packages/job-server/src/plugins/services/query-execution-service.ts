import {
  QueryExecutionService
} from "@ossinsight/api-server";
import fp from "fastify-plugin";

export default fp(async (app) => {
  const queryExecutionService = new QueryExecutionService();
  await app.decorate("queryExecutionService", queryExecutionService);
}, {
  name: '@ossinsight/query-execution-service',
  dependencies: [
    '@fastify/env'
  ],
});
