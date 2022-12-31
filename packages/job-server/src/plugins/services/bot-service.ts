import { BotService } from "@ossinsight/api-server";
import fp from "fastify-plugin";

export default fp(async (app) => {
  app.decorate('botService', new BotService(
    app.log.child({ service: 'bot-service' }),
    app.config.OPENAI_API_KEY,
  ));
}, {
  name: '@ossinsight/bot-service',
  dependencies: [
    '@fastify/env',
  ],
});
