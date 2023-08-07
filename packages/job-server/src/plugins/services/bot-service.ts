import {BotService} from "@ossinsight/api-server";
import fp from "fastify-plugin";

export default fp(async (app) => {
  app.decorate('botService', new BotService(
    app.log.child({ module: 'bot-service' }),
    app.config.OPENAI_API_KEY,
    app.promptTemplateManager,
  ));
}, {
  name: '@ossinsight/bot-service',
  dependencies: [
    '@fastify/env',
  ],
});
