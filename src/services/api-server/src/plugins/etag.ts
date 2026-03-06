import fastifyEtag from "@fastify/etag";
import fp from "fastify-plugin";

export default fp(async (app) => {
  await app.register(fastifyEtag);
}, {
  name: '@ossinsight/etag'
});
