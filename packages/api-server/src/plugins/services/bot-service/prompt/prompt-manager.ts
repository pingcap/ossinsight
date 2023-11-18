import fp from "fastify-plugin";
import fs from "node:fs";
import mustache from "mustache";
import path from "node:path";
import pino from "pino";
import { ContextProvider } from "./context/context-provider";

declare module 'fastify' {
    interface FastifyInstance {
        promptTemplateManager: PromptManager;
    }
}

export default fp(async (fastify) => {
    const log = fastify.log as pino.Logger;
    const promptTemplateDir = fastify.config.CONFIGS_PATH + "/prompts";
    fastify.decorate('promptTemplateManager', new PromptManager(log, promptTemplateDir, fastify.embeddingContextProvider));
}, {
    name: '@ossinsight/prompt-template-manager',
    dependencies: [
        '@fastify/env',
        '@ossinsight/embedding-context-provider',
    ],
});

export interface PromptConfig {
    model: string;
    stop: string[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    n: number;
}

const defaultPromptConfig: PromptConfig = {
    model: "gpt-3.5-turbo",
    stop: [],
    max_tokens: 200,
    temperature: 0,
    top_p: 1,
    n: 1,
};

export class PromptManager {
    private readonly logger: pino.Logger;
    private readonly promptConfigs: Map<string, PromptConfig> = new Map();
    private readonly promptTemplates: Map<string, string> = new Map();
    private readonly promptConfigBaseDir: string;
    private readonly loadingPromise: Promise<void>;

    constructor(logger: pino.Logger, promptTemplateDir: string, contextProvider: ContextProvider | null = null) {
        this.logger = logger;
        this.promptConfigBaseDir = promptTemplateDir;
        this.loadingPromise = this.loadPromptConfigs();
    }

    ready(): Promise<void> {
        return this.loadingPromise
    }

    public async loadPromptConfigs(): Promise<void> {
        const promptConfigBaseDir = this.promptConfigBaseDir;
        const promptNames = fs.readdirSync(promptConfigBaseDir);
        for (const promptName of promptNames) {
            // Check if a prompt config directory exists.
            const promptConfigDir = path.join(promptConfigBaseDir, promptName);
            const isDir = fs.lstatSync(promptConfigDir).isDirectory();
            if (!isDir) {
                continue;
            }

            // Load prompt config and template from files.
            await this.loadConfigFromFile(promptName, promptConfigDir);
            await this.loadTemplateFromFile(promptName, promptConfigDir);
            fs.watch(promptConfigDir, async () => {
                await this.loadConfigFromFile(promptName, promptConfigDir);
                await this.loadTemplateFromFile(promptName, promptConfigDir);
            });
        }
    }

    private async loadConfigFromFile(name: string, promptConfigDir: string) {
        const configPath = path.join(promptConfigDir, "config.json");
        if (fs.existsSync(configPath)) {
            this.logger.info(`Loading prompt <${name}> config from file ${configPath}.`);
            try {
                const overrideConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
                const config = {
                    ...defaultPromptConfig,
                    ...overrideConfig
                };
                this.promptConfigs.set(name, config);
                this.logger.info({ config }, `Prompt <${name}> config loaded.`);
            } catch (err: any) {
                throw new Error(`Failed to parse prompt config file ${configPath}: ${err.message}`, {
                    cause: err
                });
            }
        } else {
            this.logger.info(`Prompt <${name}> config file ${configPath} not found, using default config.`);
            this.promptConfigs.set(name, defaultPromptConfig);
        }
    }

    private async loadTemplateFromFile(name: string, promptConfigDir: string) {
        const templatePath = path.join(promptConfigDir, "template.mustache");
        this.logger.info(`Loading prompt <${name}> template from file ${templatePath}.`);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Prompt template file ${templatePath} not found.`);
        }
        const template = fs.readFileSync(templatePath, "utf-8");
        this.promptTemplates.set(name, template);
    }

    public async getPrompt(promptName: string, context: Record<string, any>): Promise<[string, PromptConfig]> {
        await this.ready();

        const promptConfig = this.promptConfigs.get(promptName);
        if (!promptConfig) {
            throw new Error(`The config of prompt ${promptName} not found.`);
        }

        const promptTemplate = this.promptTemplates.get(promptName);
        if (!promptTemplate) {
            throw new Error(`The template of prompt ${promptName} not found.`);
        }

        const prompt = mustache.render(promptTemplate, context, {}, {
            escape: (text) => text
        });
        return [prompt, promptConfig];
    }
}