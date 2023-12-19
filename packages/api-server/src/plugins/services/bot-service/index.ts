import {FastifyBaseLogger} from "fastify";
import {DEFAULT_EXPLORER_GENERATE_ANSWER_PROMPT_NAME} from "../../../env";
import {countAPIRequest, measureAPIRequest, openaiAPICounter, openaiAPITimer} from "../../../metrics";
import {ContextProvider} from "./prompt/context/context-provider";
import {Answer} from "./types";
import {APIError, BotResponseGenerateError, BotResponseParseError} from "../../../utils/error";
import {Configuration, OpenAIApi} from "openai";
import {DateTime} from "luxon";
import {PromptConfig, PromptManager} from './prompt/prompt-manager';
import fp from "fastify-plugin";
import pino from "pino";
import stream from "node:stream";
// @ts-ignore
import JSONStream from 'JSONStream';
import {jsonrepair} from "jsonrepair";

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
    private readonly openai: OpenAIApi;

    constructor(
      private readonly log: pino.BaseLogger,
      private readonly apiKey: string,
      private readonly promptManager: PromptManager,
      private readonly contextProvider?: ContextProvider,
      private readonly generateAnswerPromptName: string = DEFAULT_EXPLORER_GENERATE_ANSWER_PROMPT_NAME
    ) {
        const configuration = new Configuration({
            apiKey: this.apiKey
        });
        this.openai = new OpenAIApi(configuration);
    }

    async questionToSQL(logger: FastifyBaseLogger, question: string, context: Record<string, any>): Promise<Answer | null> {
        if (!question) return null;

        const api = 'question-to-sql';
        const promptName = 'playground-generate-sql';

        // Prepare prompt.
        logger.info("Preparing question to sql prompt question: %s", question);
        const [prompt, promptConfig] = await this.promptManager.getPrompt(promptName, {
            question,
            ...context
        });

        // Request answer.
        logger.info(promptConfig, "Generating SQL to answer question: %s", question);
        let res: any;
        const start = DateTime.now();
        res = await countAPIRequest(openaiAPICounter, api, async () => {
            return await measureAPIRequest(openaiAPITimer, api, async () => {
                return await this.openai.createChatCompletion({
                    messages: [
                        {
                            role: 'system',
                            content: prompt!,
                        }
                    ],
                    stream: false,
                    ...promptConfig
                });
            });
        });
        const end = DateTime.now();
        const costTime = end.diff(start).as('seconds');

        const { choices, usage } = res.data;
        logger.info({ usage }, 'Got SQL of question "%s" from OpenAI API, cost: %d s', question, costTime);

        if (Array.isArray(choices)) {
            return choices?.[0]?.message?.content || null;
        } else {
            throw new APIError(500, 'No SQL generated');
        }
    }

    private async loadGenerateAnswerPromptTemplate(question: string): Promise<[string, PromptConfig]> {
        let context: Record<string, any> = { question: question };
        if (this.contextProvider) {
            context = await this.contextProvider.provide(context);
        }
        return await this.promptManager.getPrompt(this.generateAnswerPromptName, context);
    }

    public async questionToAnswerInStream(question: string, callback: (answer: Answer, key: string, value: any) => void): Promise<[Answer | null, string | null]> {
        const api = 'question-to-answer-in-stream';

        // Prepare prompt.
        this.log.info("Preparing prompt for question (in stream mode): %s", question);
        const [prompt, promptConfig] = await this.loadGenerateAnswerPromptTemplate(question);

        // Request answer.
        this.log.info(promptConfig, "Requesting answer for question (in stream mode): %s", question);
        let answer: any = {};
        let tokens: any[] = [];

        const end = openaiAPITimer.startTimer({api});
        return new Promise(async (resolve, reject) => {
            try {
                 const res = await this.openai.createChatCompletion({
                    messages: [
                        {
                            role: 'system',
                            content: prompt!,
                        }
                    ],
                    stream: true,
                    ...promptConfig
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
                    openaiAPICounter.inc({ api, statusCode: 500 });
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
                openaiAPICounter.inc({ api, statusCode: err?.response?.status || 500 });
                reject(new BotResponseGenerateError(`Failed to complete the answer (in stream mode): ${err.message}`, tokens.join(''), err));
            }
        });
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
            const res = await countAPIRequest(openaiAPICounter, api, async () => {
                return await measureAPIRequest(openaiAPITimer,  api,async () => {
                    return await this.openai.createChatCompletion({
                        messages: [
                            {
                                role: 'system',
                                content: prompt!,
                            }
                        ],
                        stream: false,
                        ...promptConfig
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
                const sqlArr = splitSqlStatements(value);
                if (sqlArr.length > 1) {
                    this.log.warn({ sqlArr }, `Got multiple SQLs from OpenAI API: ${question}`);
                }
                // Notice: Avoid multiple SQL Error.
                answer.querySQL = sqlArr[0];
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

function splitSqlStatements(sqlString: string): string[] {
    let statements = [];
    let currentStatement = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < sqlString.length; i++) {
        const char = sqlString[i];
        const nextChar = i + 1 < sqlString.length ? sqlString[i + 1] : null;

        // Handle escape characters
        if (char === '\\' && nextChar) {
            currentStatement += char + nextChar;
            i++; // Skip the next character
            continue;
        }

        // Toggle single quote state
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
        }

        // Toggle double quote state
        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
        }

        // If not within quotes and a semicolon is encountered, split the statement
        if (char === ';' && !inSingleQuote && !inDoubleQuote) {
            statements.push(currentStatement.trim());
            currentStatement = '';
            continue;
        }

        currentStatement += char;
    }

    // Add the last statement if it exists
    if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
    }

    return statements;
}