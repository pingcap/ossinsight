import fp from "fastify-plugin";
import fs from "node:fs";
import mustache from "mustache";
import path from "node:path";
import pino from "pino";

declare module 'fastify' {
    interface FastifyInstance {
        promptTemplateManager: PromptTemplateManager;
    }
}

export default fp(async (fastify) => {
    const log = fastify.log as pino.Logger;
    const promptTemplateDir = fastify.config.CONFIGS_PATH + "/prompts";
    fastify.decorate('promptTemplateManager', new PromptTemplateManager(log, promptTemplateDir));
}, {
    name: 'prompt-template-manager',
    dependencies: [
        '@fastify/env'
    ],
});

export class PromptTemplateManager {
    private readonly logger: pino.Logger;
    private readonly promptTemplates: Map<string, string> = new Map();
    private readonly templateBaseDir: string;
    private readonly loadingPromise: Promise<void>;

    constructor(logger: pino.Logger, promptTemplateDir: string) {
        this.logger = logger;
        this.templateBaseDir = promptTemplateDir;
        this.loadingPromise = this.loadTemplates();
    }

    ready(): Promise<void> {
        return this.loadingPromise
    }

    public async loadTemplates(): Promise<void> {
        const templateBaseDir = this.templateBaseDir;
        const promptTemplateDirs = fs.readdirSync(templateBaseDir);
        for (const promptTemplateDir of promptTemplateDirs) {
            const isDir = fs.lstatSync(path.join(templateBaseDir, promptTemplateDir)).isDirectory();
            if (!isDir) {
                continue;
            }
            const promptTemplatePath = path.join(templateBaseDir, promptTemplateDir, "template.mustache");
            await this.loadTemplateFile(promptTemplateDir, promptTemplatePath);
            fs.watchFile(promptTemplatePath, async () => {
                await this.loadTemplateFile(promptTemplateDir, promptTemplatePath);
            });
        }
    }

    public async loadTemplateFile(promptTemplateDir: string, promptPath: string) {
        this.logger.info(`Loading prompt template from ${promptPath}`);
        const promptTemplate = fs.readFileSync(promptPath, "utf-8");
        this.promptTemplates.set(promptTemplateDir, promptTemplate);
    }

    public async getTemplate(promptName: string, context: Record<string, any>): Promise<string | null> {
        await this.ready();
        const promptTemplate = this.promptTemplates.get(promptName);
        if (!promptTemplate) {
            return null;
        }
        return mustache.render(promptTemplate, context);
    }
}