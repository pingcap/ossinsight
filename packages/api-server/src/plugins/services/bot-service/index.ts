import {countAPIRequest, measure, openaiAPICounter as counter, openaiAPITimer} from "../../../metrics";
import {Answer, AnswerSummary, RecommendedChart, RecommendQuestion} from "./types";
import {BotResponseGenerateError, BotResponseParseError} from "../../../utils/error";
import {Configuration, OpenAIApi} from "openai";
import {DateTime} from "luxon";
import {GenerateAnswerPromptTemplate} from "./template/GenerateAnswerPromptTemplate";
import {GenerateChartPromptTemplate} from "./template/GenerateChartPromptTemplate";
import {GenerateQuestionsPromptTemplate} from "./template/GenerateQuestionsPromptTemplate";
import {GenerateSQLPromptTemplate} from "./template/GenerateSQLPromptTemplate";
import {GenerateSummaryPromptTemplate} from "./template/GenerateSummaryPromptTemplate";
import {PromptTemplateManager} from './prompt/prompt-template-manager';
import fp from "fastify-plugin";
import pino from "pino";
import stream from "node:stream";
// @ts-ignore
import JSONStream from 'JSONStream';
import {jsonrepair} from "jsonrepair";
import {DEFAULT_ANSWER_PROMPT_TEMPLATE} from "../../../env";

declare module 'fastify' {
  interface FastifyInstance {
      botService: BotService;
  }
}

export default fp(async (app) => {
    const log = app.log.child({ service: 'bot-service'}) as pino.Logger;
    app.decorate('botService', new BotService(log, app.config.OPENAI_API_KEY, app.promptTemplateManager, app.config.PROMPT_TEMPLATE_NAME));
}, {
  name: '@ossinsight/bot-service',
  dependencies: [
      '@ossinsight/prompt-template-manager'
  ]
});

const tableColumnRegexp = /(?<table_name>.+)\.(?<column_name>.+)/;

export class BotService {
    private readonly openai: OpenAIApi;

    constructor(
      private readonly log: pino.BaseLogger,
      private readonly apiKey: string,
      private readonly promptTemplateManager: PromptTemplateManager,
      private readonly promptTemplateName: string = DEFAULT_ANSWER_PROMPT_TEMPLATE
    ) {
        const configuration = new Configuration({
            apiKey: this.apiKey
        });
        this.openai = new OpenAIApi(configuration);
    }

    async questionToSQL(template: GenerateSQLPromptTemplate, question: string, context: Record<string, any>): Promise<string | null> {
        const api = 'question-to-sql';
        if (!question) return null;
        const prompt = template.stringify(question, context);
        this.log.info("Requesting SQL for question: %s", question);

        let res: any, costTime: number = 0;
        try {
            const start = DateTime.now();
            const timer = openaiAPITimer.labels({ api });
            res = await countAPIRequest(counter, api, async () => {
                return await measure(timer, async () => {
                    return await this.openai.createCompletion({
                        model: template.model,
                        prompt,
                        stream: false,
                        stop: template.stop,
                        temperature: template.temperature,
                        max_tokens: template.maxTokens,
                        top_p: template.topP,
                        n: template.n
                    });
                });
            });
            const end = DateTime.now();
            costTime = end.diff(start).as('seconds');
        } catch (err) {
            throw err;
        }

        const { choices, usage } = res.data;
        this.log.info({ usage }, 'Got SQL of question "%s" from OpenAI API, cost: %d s', question, costTime);

        if (Array.isArray(choices)) {
            return choices[0]?.text || null;
        } else {
            return null;
        }
    }

    async dataToChart(template: GenerateChartPromptTemplate, question: string, data: any): Promise<RecommendedChart | null> {
        const api = 'data-to-chart';
        if (!data) return null;

        // Slice the array data to avoid too long prompt
        if (Array.isArray(data)) {
            data = data.slice(0, 2);
        }

        const prompt = template.stringify(question, data);
        const timer = openaiAPITimer.labels({ api });
        const res = await countAPIRequest(counter, api, async () => {
            return await measure(timer, async () => {
                return await this.openai.createCompletion({
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
            });
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

    async questionToAnswerInStream(template: GenerateAnswerPromptTemplate, question: string, callback: (answer: Answer, key: string, value: any) => void): Promise<[Answer | null, string | null]> {
        const api = 'question-to-answer-in-stream';
        let prompt = await this.promptTemplateManager.getTemplate(this.promptTemplateName, {
            question: question
        });

        // If the prompt is not found, use the default template.
        if (!prompt) {
            prompt = template.stringify(question);
        }

        this.log.info("Requesting answer for question (in stream mode): %s", question);
        let answer: any = {};
        let tokens: any[] = [];

        const end = openaiAPITimer.startTimer({api});
        return new Promise(async (resolve, reject) => {
            try {
                 const res = await this.openai.createChatCompletion({
                    model: template.model,
                    messages: [
                        {
                            role: 'system',
                            content: prompt!,
                        }
                    ],
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
                        // Notice: Skip undefined chunk.
                        if (chunk) {
                            this.push(chunk);
                            tokens.push(chunk.toString());
                        }
                        callback();
                    },
                });

                // @ts-ignore
                res.data.on("data", (data) => {
                    // Notice:
                    // The data is start with "data: " prefix, we need to remove it to get a JSON string.
                    // In same times, there are multiple JSONs return in one response.
                    const streamResponseText = data?.toString();
                    const tokenJSONs = streamResponseText?.slice(6)?.split("\n\ndata: ").filter(Boolean);
                    if (!Array.isArray(tokenJSONs) || tokenJSONs.length === 0) {
                        this.log.warn(`Got an empty token response from stream: ${question}`);
                        return;
                    }

                    try {
                        for (const tokenJSON of tokenJSONs) {
                            if (tokenJSON === "[DONE]\n\n") {
                                tokenStream.end();
                            } else {
                                // Notice: Skip undefined token.
                                const tokenObj = JSON.parse(tokenJSON);
                                const choice = tokenObj.choices?.[0];

                                if (choice?.delta?.role) {
                                    continue;
                                }
                                if (choice?.finish_reason === 'stop' && !choice?.content) {
                                    continue;
                                }
                                if (choice?.finish_reason === 'length') {
                                    tokenStream.emit('error', new Error('Exceed max token length'));
                                    continue;
                                }

                                const token = choice?.delta?.content;
                                if (typeof token === "string") {
                                    tokenStream.write(token);
                                } else {
                                    this.log.warn({ tokenObj }, `Got an empty token from stream: ${question}.`);
                                }
                            }
                        }
                    } catch (err: any) {
                        end();
                        if (err instanceof SyntaxError) {
                            reject(new BotResponseParseError(`Failed to parse the answer (in stream mode): ${err.message}`, streamResponseText, err));
                        } else {
                            reject(new BotResponseGenerateError(`Failed to generate the answer (in stream mode): ${err.message}`, streamResponseText, err));
                        }
                    }
                });

                // @ts-ignore
                res.data.on("error", (err) => {
                    end();
                    counter.inc({ api, statusCode: 500 });
                    reject(new BotResponseGenerateError(`Failed to process the answer (in stream mode): ${err.message}`, tokens.join(''), err));
                });

                // Convert token stream to object field stream.
                const fieldStream = tokenStream.pipe(JSONStream.parse([{
                    emitKey: true
                }]));

                fieldStream.on('data', async ({key, value}: any) => {
                    [answer, key, value] = this.setAnswerValue(question, answer, key, value);
                    await callback(answer, key, value);
                });

                fieldStream.on('error', (err: any) => {
                    end();
                    reject(new BotResponseParseError(`Failed to extract the fields of the answer (in stream mode): ${err.message}`, tokens.join(''), err));
                });

                fieldStream.on('end', () => {
                    end();
                    fieldStream.destroy();
                    resolve([answer, tokens.join('')]);
                });
            } catch (err: any) {
                end();
                counter.inc({ api, statusCode: err?.response?.status || 500 });
                reject(new BotResponseGenerateError(`Failed to complete the answer (in stream mode): ${err.message}`, tokens.join(''), err));
            }
        });
    }

    async questionToAnswerInNonStream(template: GenerateAnswerPromptTemplate, question: string): Promise<[Answer | null, string | null]> {
        const api = 'question-to-answer-in-non-stream';
        let prompt = await this.promptTemplateManager.getTemplate(this.promptTemplateName, {
            question: question
        });

        // If the prompt is not found, use the default template.
        if (prompt == null) {
            prompt = template.stringify(question);
        }

        let responseText = null;
        try {
            this.log.info("Requesting answer for question (in non-steam mode): %s", question);
            const start = DateTime.now();
            const timer = openaiAPITimer.labels({api});
            const res = await countAPIRequest(counter, api, async () => {
                return await measure(timer, async () => {
                    return await this.openai.createChatCompletion({
                        model: template.model,
                        messages: [
                            {
                                role: 'user',
                                content: prompt!,
                            }
                        ],
                        stream: false,
                        stop: template.stop,
                        temperature: template.temperature,
                        max_tokens: template.maxTokens,
                        top_p: template.topP,
                        n: template.n,
                    });
                });
            });
            const {choices, usage} = res.data;
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

    setAnswerValue(question: string, answer: Record<string, any>, key: string, value: any) {
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
            default:
                answer[key] = value;
                break;
        }

        return [answer, key, value];
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
        const api = 'recommend-questions';
        const prompt = template.stringify(n);

        let questions = null;
        try {
            const timer = openaiAPITimer.labels({api});
            const res = await countAPIRequest(counter, api, async () => {
                return await measure(timer, async () => {
                    return await this.openai.createCompletion({
                        model: template.model,
                        prompt,
                        stream: false,
                        stop: template.stop,
                        temperature: template.temperature,
                        max_tokens: template.maxTokens,
                        top_p: template.topP,
                        n: template.n
                    });
                });
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
        const api = 'summary-answer';
        const prompt = template.stringify(question, result, result.length);

        let responseText = null;
        let summary = null;
        try {
            this.log.info("Requesting answer summary for question: %s", question);
            const start = DateTime.now();
            const timer = openaiAPITimer.labels({api});
            const res = await countAPIRequest(counter, api, async () => {
                return await measure(timer, async () => {
                    return await this.openai.createCompletion({
                        model: template.model,
                        prompt,
                        stream: false,
                        stop: template.stop,
                        temperature: template.temperature,
                        max_tokens: template.maxTokens,
                        top_p: template.topP,
                        n: template.n,
                    });
                });
            });
            const {choices, usage} = res.data;
            const end = DateTime.now();
            this.log.info({ usage }, 'Got summary of question "%s" from OpenAI API, cost: %d s', question, end.diff(start).as('seconds'));

            if (Array.isArray(choices) && choices[0].text) {
                responseText = choices[0].text;
                summary = JSON.parse(responseText);
                return summary
            } else {
                return null;
            }
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                this.log.error({ err, responseText }, `Failed to parse the summary for question: ${question}`);
                throw new BotResponseParseError('failed to parse the summary', responseText, err);
            } else {
                this.log.error({ err }, `Failed to get summary for question: ${question}`);
                throw new BotResponseGenerateError(`failed to generate the summary`, err);
            }
        }
    }

}
