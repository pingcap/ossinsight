import {Answer, AnswerSummary, RecommendedChart, RecommendQuestion} from "./types";
import {BotResponseGenerateError, BotResponseParseError} from "../../../utils/error";
import {Configuration, OpenAIApi} from "openai";

import {DateTime} from "luxon";
import {GenerateAnswerPromptTemplate} from "./template/GenerateAnswerPromptTemplate";
import {GenerateChartPromptTemplate} from "./template/GenerateChartPromptTemplate";
import {GenerateQuestionsPromptTemplate} from "./template/GenerateQuestionsPromptTemplate";
import {GenerateSQLPromptTemplate} from "./template/GenerateSQLPromptTemplate";
import {GenerateSummaryPromptTemplate} from "./template/GenerateSummaryPromptTemplate";
import {PromptTemplateManager} from '../../config/prompt-template-manager';
import fp from "fastify-plugin";
import pino from "pino";
import stream from "node:stream";
// @ts-ignore
import JSONStream from 'JSONStream';

declare module 'fastify' {
  interface FastifyInstance {
      botService: BotService;
  }
}

export default fp(async (fastify) => {
    const log = fastify.log.child({ service: 'bot-service'}) as pino.Logger;
    fastify.decorate('botService', new BotService(log, fastify.config.OPENAI_API_KEY, fastify.promptTemplateManager));
}, {
  name: '@ossinsight/bot-service',
  dependencies: []
});

const GENERATE_ANSWER_PROMPT_TEMPLATE_NAME = 'explorer-generate-answer';

const tableColumnRegexp = /(?<table_name>.+)\.(?<column_name>.+)/;

export class BotService {
    private readonly openai: OpenAIApi;

    constructor(
        private readonly log: pino.BaseLogger,
        private readonly apiKey: string,
        private readonly promptTemplateManager: PromptTemplateManager
    ) {
        const configuration = new Configuration({
            apiKey: this.apiKey
        });
        this.openai = new OpenAIApi(configuration);
    }

    async questionToSQL(template: GenerateSQLPromptTemplate, question: string, context: Record<string, any>): Promise<string | null> {
        if (!question) return null;
        const prompt = template.stringify(question, context);
        this.log.info("Requesting SQL for question: %s", question);

        const start = DateTime.now();
        const res = await this.openai.createCompletion({
            model: template.model,
            prompt,
            stream: false,
            stop: template.stop,
            temperature: template.temperature,
            max_tokens: template.maxTokens,
            top_p: template.topP,
            n: template.n
        });
        const end = DateTime.now();
        const { choices, usage } = res.data;
        this.log.info({ usage }, 'Got SQL of question "%s" from OpenAI API, cost: %d s', question, end.diff(start).as('seconds'));

        if (Array.isArray(choices)) {
            return choices[0]?.text || null;
        } else {
            return null;
        }
    }

    async dataToChart(template: GenerateChartPromptTemplate, question: string, data: any): Promise<RecommendedChart | null> {
        if (!data) return null;

        // Slice the array data to avoid too long prompt
        if (Array.isArray(data)) {
            data = data.slice(0, 2);
        }

        const prompt = template.stringify(question, data);
        const res = await this.openai.createCompletion({
            model: template.model,
            prompt,
            stream: false,
            stop: template.stop,
            temperature: template.temperature,
            max_tokens: template.maxTokens,
            top_p: template.topP,
            n: template.n,
            logprobs: template.logprobs,
        });
        const {choices, usage} = res.data;
        this.log.info(usage, 'OpenAI API usage');

        if (!Array.isArray(choices)) {
            return null;
        }

        const text = choices[0].text;
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (err) {
            this.log.error(err, `Failed to parse chart: ${text}`);
            return null;
        }
    }

    async questionToAnswer(template: GenerateAnswerPromptTemplate, question: string, callback: (answer: Answer, key: string, value: any) => void): Promise<Answer | null> {
        let prompt = await this.promptTemplateManager.getTemplate(GENERATE_ANSWER_PROMPT_TEMPLATE_NAME, {
            question: question
        });

        // If the prompt is not found, use the default template.
        if (prompt == null) {
            prompt = template.stringify(question);
        }

        this.log.info("Requesting answer for question: %s", question);
        let answer: any = {};
        let tokens: any[] = [];

        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.openai.createCompletion({
                    model: template.model,
                    prompt,
                    stream: true,
                    stop: template.stop,
                    temperature: template.temperature,
                    max_tokens: template.maxTokens,
                    top_p: template.topP,
                    n: template.n,
                }, {
                    responseType: 'stream'
                });

                // Convert only-data-event stream to token stream.
                const tokenStream = new stream.Transform({
                    transform(chunk, encoding, callback) {
                        this.push(chunk);
                        tokens.push(chunk);
                        callback();
                    },
                });

                // @ts-ignore
                res.data.on("data", (data) => {
                    // Notice:
                    // The data is start with "data: " prefix, we need to remove it to get a JSON string.
                    // In same times, there are multiple JSONs return in one response.
                    const responseText = data?.toString();
                    const tokenJSONs = responseText?.slice(6)?.split("\n\ndata: ");
                    if (!Array.isArray(tokenJSONs) || tokenJSONs.length === 0) {
                        return;
                    }

                    try {
                        for (const tokenJSON of tokenJSONs) {
                            if (tokenJSON === "[DONE]\n\n") {
                                tokenStream.end();
                            } else {
                                const token = JSON.parse(tokenJSON)?.choices?.[0]?.text;
                                tokenStream.write(token);
                            }
                        }
                    } catch (err: any) {
                        if (err instanceof SyntaxError) {
                            this.log.error({ err, responseText }, `Failed to parse the token stream of answer for question: ${question}`);
                            reject(new BotResponseParseError(err.message, responseText, err));
                        } else {
                            reject(new BotResponseGenerateError(err.message, err));
                        }
                    }
                });

                // @ts-ignore
                res.data.on("error", (err) => {
                    reject(new BotResponseGenerateError(err.message, err));
                });

                // Convert token stream to object field stream.
                const fieldStream = tokenStream.pipe(JSONStream.parse([{
                    emitKey: true
                }]));

                fieldStream.on('data', ({key, value}: any) => {
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
                            answer.combinedTitle = value || question;
                            break;
                        case 'sql':
                            key = "querySQL";
                            answer.querySQL = value;
                            break;
                        case 'chart':
                            answer.chart = value ? {
                                chartName: value.chartName,
                                title: value.title,
                                ...this.removeTableNameForColumn(value.options)
                            } : null;
                            break;
                        default:
                            answer[key] = value;
                            break;
                    }

                    callback(answer, key, value);
                });

                fieldStream.on('error', (err: any) => {
                    const answerJSON = tokens.join('');
                    this.log.error({ err, answerJSON }, `Failed to parse the answer for question: ${question}`);
                    reject(new BotResponseParseError(err.message, answerJSON, err));
                });

                fieldStream.on('end', () => {
                    fieldStream.destroy();
                    resolve(answer);
                });
            } catch (err: any) {
                this.log.error({ err }, `Failed to get answer for question: ${question}`);
                reject(new BotResponseGenerateError(err.message, err));
            }
        });
    }

    removeTableNameForColumn(chartOptions: Record<string, string>) {
        Object.entries(chartOptions).forEach(([key, value]) => {
            const match = tableColumnRegexp.exec(value);
            if (match) {
                const groups = match.groups as any;
                chartOptions[key] = groups.column_name;
            }
        });
        return chartOptions;
    }

    async generateRecommendQuestions(template: GenerateQuestionsPromptTemplate, n: number): Promise<RecommendQuestion[]> {
        const prompt = template.stringify(n);

        let questions = null;
        try {
            const res = await this.openai.createCompletion({
                model: template.model,
                prompt,
                stream: false,
                stop: template.stop,
                temperature: template.temperature,
                max_tokens: template.maxTokens,
                top_p: template.topP,
                n: template.n
            });
            const {choices, usage} = res.data;
            this.log.info({ usage }, 'Request to generate %d questions from OpenAI API', n);

            if (Array.isArray(choices) && choices[0].text) {
                questions = JSON.parse(choices[0].text);
                return questions.map((q: any) => {
                    return {
                        title: q.title,
                        aiGenerated: true
                    }
                });
            } else {
                this.log.warn({ response: res.data }, 'Got empty questions');
                return [];
            }
        } catch (err) {
            this.log.error({ err }, 'Failed to generate recommend questions.');
            return [];
        }
    }

    async summaryAnswer(template: GenerateSummaryPromptTemplate, question: string, result: any[]): Promise<AnswerSummary | null> {
        const prompt = template.stringify(question, result, result.length);

        let choice = undefined;
        let summary = null;
        try {
            this.log.info("Requesting answer summary for question: %s", question);
            const start = DateTime.now();
            const res = await this.openai.createCompletion({
                model: template.model,
                prompt,
                stream: false,
                stop: template.stop,
                temperature: template.temperature,
                max_tokens: template.maxTokens,
                top_p: template.topP,
                n: template.n,
            });
            const {choices, usage} = res.data;
            const end = DateTime.now();
            this.log.info({ usage }, 'Got summary of question "%s" from OpenAI API, cost: %d s', question, end.diff(start).as('seconds'));

            if (Array.isArray(choices) && choices[0].text) {
                choice = choices[0].text;
                summary = JSON.parse(choice);
                return summary
            } else {
                return null;
            }
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                this.log.error({ err, choice }, `Failed to parse the summary for question: ${question}`);
                throw new BotResponseParseError('failed to parse the summary', choice, err);
            } else {
                this.log.error({ err }, `Failed to get summary for question: ${question}`);
                throw new BotResponseGenerateError(`failed to generate the summary`, err);
            }
        }
    }

}
