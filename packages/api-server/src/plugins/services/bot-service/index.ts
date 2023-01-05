import { Configuration, OpenAIApi } from "openai";
import fp from "fastify-plugin";
import pino from "pino";

import {SQLGeneratePromptTemplate} from "./template/GenerateSQLPromptTemplate";
import {GenerateChartPromptTemplate} from "./template/GenerateChartPromptTemplate";
import {Answer, RecommendedChart, RecommendQuestion} from "./types";
import {GenerateAnswerPromptTemplate} from "./template/GenerateAnswerPromptTemplate";
import {GenerateQuestionsPromptTemplate} from "./template/GenerateQuestionsPromptTemplate";

declare module 'fastify' {
  interface FastifyInstance {
      botService: BotService;
  }
}

export default fp(async (fastify) => {
    const log = fastify.log.child({ service: 'bot-service'}) as pino.Logger;
    fastify.decorate('botService', new BotService(log, fastify.config.OPENAI_API_KEY));
}, {
  name: '@ossinsight/bot-service',
  dependencies: []
});

export class BotService {
    private readonly openai: OpenAIApi;

    constructor(
        private readonly log: pino.BaseLogger,
        private readonly apiKey: string
    ) {
        const configuration = new Configuration({
            apiKey: this.apiKey
        });
        this.openai = new OpenAIApi(configuration);
    }

    async questionToSQL(template: SQLGeneratePromptTemplate, question: string, context: Record<string, any>): Promise<string | null> {
        if (!question) return null;
        const prompt = template.stringify(question, context);
        this.log.debug(prompt, `Get completion for question: ${question}`);
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

        const { choices, usage } = res.data;
        this.log.info(usage, 'OpenAI API usage');

        if (Array.isArray(choices)) {
            return `${template.resultPrefix}${choices[0]?.text}`;
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

    async questionToAnswer(template: GenerateAnswerPromptTemplate, question: string): Promise<Answer> {
        const prompt = template.stringify(question);

        let answer = null;
        try {
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
            this.log.info({ usage }, 'Got answer of question "%s" from OpenAI API', question);

            if (Array.isArray(choices) && choices[0].text) {
                answer = JSON.parse(choices[0].text);
                return answer
            } else {
                this.log.warn({ response: res.data }, 'Got empty answer for question: %s', question);
                return {
                    questions: []
                };
            }
        } catch (err) {
            this.log.error({ err, answer }, 'Failed to get answer for question: %s', question);
            return {
                questions: []
            };
        }
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
                n: template.n,
                logprobs: template.logprobs,
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
}
