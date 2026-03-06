import {PromptManager} from "@ossinsight/api-server";
import fp from "fastify-plugin";
import pino from "pino";

export default fp(async (app) => {
  const log = app.log as pino.Logger;
  const promptTemplateDir = app.config.CONFIGS_PATH + "/prompts";
  app.decorate('promptTemplateManager', new PromptManager(log, promptTemplateDir));
}, {
  name: '@ossinsight/prompt-template-manager',
  dependencies: [
    '@fastify/env',
  ],
});
