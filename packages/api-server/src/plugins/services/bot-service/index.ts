import {FastifyBaseLogger} from "fastify";
import {DEFAULT_EXPLORER_GENERATE_ANSWER_PROMPT_NAME} from "../../../env";
import {measureAPIRequest, openaiAPITimer} from "../../../metrics";
import {ContextProvider} from "./prompt/context/context-provider";
import {Answer} from "./types";
import {APIError, BotResponseGenerateError, BotResponseParseError} from "../../../utils/error";
import {DateTime} from "luxon";
import {PromptConfig, PromptManager} from './prompt/prompt-manager';
import fp from "fastify-plugin";
import pino from "pino";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { enforceSQLPolicy, positiveId } from "../../../core/playground/sql-policy";
import {jsonrepair} from "jsonrepair";
import OpenAI from "openai";

declare module 'fastify' {
  interface FastifyInstance {
      botService: BotService;
  }
}
export default fp(async (app) => {
    const log = app.log.child({ service: 'bot-service'}) as pino.Logger;
    app.decorate('botService', new BotService(
      log,
      app.config.OPENAI_API_KEY,
      app.promptTemplateManager,
      app.embeddingContextProvider,
      app.config.EXPLORER_GENERATE_ANSWER_PROMPT_NAME
    ));
}, {
  name: '@ossinsight/bot-service',
  dependencies: [
      '@ossinsight/prompt-template-manager'
  ]
});

const tableColumnRegexp = /(?<table_name>.+)\.(?<column_name>.+)/;

export class BotService {
    private readonly openai: OpenAI;

    constructor(
      private readonly log: pino.BaseLogger,
      private readonly apiKey: string,
      private readonly promptManager: PromptManager,
      private readonly contextProvider?: ContextProvider,
      private readonly generateAnswerPromptName: string = DEFAULT_EXPLORER_GENERATE_ANSWER_PROMPT_NAME
    ) {
        this.openai = new OpenAI({
            apiKey: this.apiKey
        });
    }

    async questionToSQL(logger: FastifyBaseLogger, question: string, context: Record<string, any>): Promise<string | null> {
        if (!question) return null;

        const api = 'question-to-sql';
        const promptName = 'playground-generate-sql';

        // Prepare prompt.
        logger.info("Preparing question to sql prompt question: %s", question);
        const [prompt, promptConfig] = await this.promptManager.getPrompt(promptName, {
            ...context,
            question
        });

        // Request answer.
        logger.info(promptConfig, "Generating SQL to answer question: %s", question);
        let res: any;
        const start = DateTime.now();
        res = await measureAPIRequest(openaiAPITimer, api, async () => {
            return this.openai.chat.completions.create({
                messages: prompt,
                stream: false,
                response_format: {
                    type: 'json_object'
                },
                ...promptConfig
            });
        });
        const end = DateTime.now();
        const costTime = end.diff(start).as('seconds');

        const { choices, usage } = res;
        logger.info({ usage }, 'Got SQL of question "%s" from OpenAI API, cost: %d s', question, costTime);

        if (Array.isArray(choices)) {
            const content = choices?.[0]?.message?.content;
            if (!content) return null;
            const result = JSON.parse(content);
            if (result.sql === null) return null;
            return enforceSQLPolicy(result.sql, {
                scope: { field: 'repo_id', id: positiveId(context.repo_id) },
                identity: context, maxRows: 100,
            });
        } else {
            throw new APIError(500, 'No SQL generated');
        }
    }

    private async loadGenerateAnswerPromptTemplate(question: string): Promise<[ChatCompletionMessageParam[], PromptConfig]> {
        // Check availability before any retrieval-service egress.
        await this.promptManager.getPrompt(this.generateAnswerPromptName, { question });
        let context: Record<string, any> = { question: question };
        if (this.contextProvider && this.generateAnswerPromptName === 'embedding-explorer-generate-answer') {
            context = { ...await this.contextProvider.provide(context), question };
        }
        return await this.promptManager.getPrompt(this.generateAnswerPromptName, context);
    }

    public async questionToAnswerInStream(question: string, callback: (answer: Answer, key: string, value: any) => void): Promise<[Answer | null, string | null]> {
        const [messages, config] = await this.loadGenerateAnswerPromptTemplate(question);
        const response = await this.openai.chat.completions.create({
            ...config, messages, response_format: { type: 'json_object' }, stream: true,
        });
        // Buffer the complete object: partial SQL is never a validated answer.
        let text = '';
        for await (const chunk of response) {
            const choice = chunk.choices[0];
            if (choice?.finish_reason === 'length') throw new BotResponseGenerateError('Answer exceeded token limit', text);
            text += choice?.delta?.content ?? '';
        }
        const object = JSON.parse(jsonrepair(text));
        const answer: any = {};
        for (const [key, value] of Object.entries(object)) this.setAnswerValue(question, answer, key, value);
        for (const [key, value] of Object.entries(answer)) await callback(answer, key, value);
        return [answer, text];
    }

    public async questionToAnswerInNonStream(question: string): Promise<[Answer | null, string | null]> {
        const api = 'question-to-answer-in-non-stream';

        // Prepare prompt.
        this.log.info("Preparing prompt for question (in non-stream mode): %s", question);
        const [prompt, promptConfig] = await this.loadGenerateAnswerPromptTemplate(question);

        // Request answer.
        this.log.info(promptConfig, "Requesting answer for question (in non-steam mode): %s", question);
        let responseText = null;
        try {
            const start = DateTime.now();
            const res = await measureAPIRequest(openaiAPITimer,  api,async () => {
                return this.openai.chat.completions.create({
                    messages: prompt,
                    response_format: {
                      type: 'json_object'
                    },
                    stream: false,
                    ...promptConfig
                });
            });
            const { choices, usage } = res;
            const end = DateTime.now();
            this.log.info({ usage }, 'Got answer of question "%s" from OpenAI API, cost: %d s', question, end.diff(start).as('seconds'));

            if (Array.isArray(choices) && choices[0]?.message?.content) {
                responseText = choices[0]?.message?.content;
                const repaired = jsonrepair(responseText);
                const obj = JSON.parse(repaired);
                const answer: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    this.setAnswerValue(question, answer, key, value);
                }
                return [answer, responseText]
            } else {
                return [null, responseText]
            }
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                throw new BotResponseParseError(`Failed to parse the answer (in non-stream mode): ${err.message}`, responseText, err);
            } else {
                throw new BotResponseGenerateError(`Failed to generate the answer (in non-stream mode): ${err.message}`, responseText, err);
            }
        }
    }

    private setAnswerValue(question: string, answer: Record<string, any>, key: string, value: any) {
        switch (key) {
            case 'RQ':
                key = "revisedTitle";
                answer.revisedTitle = value || question;
                break;
            case 'sqlCanAnswer':
                answer.sqlCanAnswer = value == null ? true : value;
                break;
            case 'notClear':
                answer.notClear = value;
                break;
            case 'assumption':
                answer.assumption = value;
                break;
            case 'CQ':
                key = "combinedTitle";
                value = value || question;
                answer.combinedTitle = value;
                break;
            case 'sql':
                key = "querySQL";
                // No SQL means the model could not answer (sqlCanAnswer: false);
                // the explorer reports that instead of a generation failure.
                value = typeof value === 'string' && value.trim() ? enforceSQLPolicy(value) : null;
                answer.querySQL = value;
                break;
            case 'chart':
                value = value ? {
                    chartName: value.chartName,
                    title: value.title,
                    ...value.options ? this.removeTableNameForColumn(value.options) : {}
                } : null;
                answer.chart = value;
                break;
            case 'keywords':
            case 'links':
            case 'subQuestions':
            case 'deps':
                answer[key] = value;
                break;
            default:
                throw new BotResponseParseError('Unexpected answer field', null);
        }

        return [answer, key, value];
    }

    private removeTableNameForColumn(chartOptions: Record<string, string>) {
        Object.entries(chartOptions).forEach(([key, value]) => {
            const match = tableColumnRegexp.exec(value);
            if (match) {
                const groups = match.groups as any;
                chartOptions[key] = groups.column_name;
            }
        });
        return chartOptions;
    }

}
