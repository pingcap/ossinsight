import { Configuration, OpenAIApi } from "openai";
import fp from "fastify-plugin";
import pino from "pino";

import {SQLGeneratePromptTemplate} from "./template/GenerateSQLPromptTemplate";
import {GenerateChartPromptTemplate} from "./template/GenerateChartPromptTemplate";
import {Answer, RecommendedChart, RecommendQuestion, AnswerSummary} from "./types";
import {GenerateAnswerPromptTemplate} from "./template/GenerateAnswerPromptTemplate";
import {GenerateQuestionsPromptTemplate} from "./template/GenerateQuestionsPromptTemplate";
import {DateTime} from "luxon";
import {BotResponseGenerateError, BotResponseParseError} from "../../../utils/error";
import {GenerateSummaryPromptTemplate} from "./template/GenerateSummaryPromptTemplate";

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

    async questionToAnswer(template: GenerateAnswerPromptTemplate, question: string): Promise<Answer | null> {
        const prompt = template.stringify(question);

        let choice = undefined;
        let answer = null;
        try {
            this.log.info("Requesting answer for question: %s", question);
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
            this.log.info({ usage }, 'Got answer of question "%s" from OpenAI API, cost: %d s', question, end.diff(start).as('seconds'));

            if (Array.isArray(choices) && choices[0].text) {
                choice = choices[0].text;
                answer = JSON.parse(choice);
                return answer
            } else {
                return null;
            }
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                this.log.error({ err, choice }, `Failed to parse the answer for question: ${question}`);
                throw new BotResponseParseError('failed to parse the answer', choice, err);
            } else {
                this.log.error({ err }, `Failed to get answer for question: ${question}`);
                throw new BotResponseGenerateError(`failed to generate the answer`, err);
            }
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
