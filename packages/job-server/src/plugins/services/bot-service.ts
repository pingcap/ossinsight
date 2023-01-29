import {BotService, PromptTemplateManager} from "@ossinsight/api-server";
import fp from "fastify-plugin";
import pino from "pino";

export default fp(async (app) => {
  const log = app.log as pino.Logger;
  const promptTemplateDir = app.config.CONFIGS_PATH + "/prompts";
  app.decorate('promptTemplateManager', new PromptTemplateManager(log, promptTemplateDir));
  const promptTemplateManager = new PromptTemplateManager(log, promptTemplateDir);

  app.decorate('botService', new BotService(
    app.log.child({ service: 'bot-service' }),
    app.config.OPENAI_API_KEY,
    promptTemplateManager
  ));
}, {
  name: '@ossinsight/bot-service',
  dependencies: [
    '@fastify/env',
  ],
});
