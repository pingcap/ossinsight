import fastifyUrlData from "@fastify/url-data";
import fp from "fastify-plugin";

export default fp(async (app) => {
  await app.register(fastifyUrlData);
}, {
  name: '@ossinsight/url-data'
});
