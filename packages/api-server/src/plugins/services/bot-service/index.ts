import {Answer, AnswerSummary, RecommendQuestion, RecommendedChart} from "./types";
import {BotResponseGenerateError, BotResponseParseError} from "../../../utils/error";
import { Configuration, OpenAIApi } from "openai";

import {DateTime} from "luxon";
import {GenerateAnswerPromptTemplate} from "./template/GenerateAnswerPromptTemplate";
import {GenerateChartPromptTemplate} from "./template/GenerateChartPromptTemplate";
import {GenerateQuestionsPromptTemplate} from "./template/GenerateQuestionsPromptTemplate";
import {GenerateSQLPromptTemplate} from "./template/GenerateSQLPromptTemplate";
import {GenerateSummaryPromptTemplate} from "./template/GenerateSummaryPromptTemplate";
import { PromptTemplateManager } from '../../config/prompt-template-manager';
import fp from "fastify-plugin";
import pino from "pino";

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

    async questionToAnswer(template: GenerateAnswerPromptTemplate, question: string): Promise<Answer | null> {
        let prompt = await this.promptTemplateManager.getTemplate(GENERATE_ANSWER_PROMPT_TEMPLATE_NAME, {
            question: question
        });

        // If the prompt is not found, use the default template.
        if (prompt == null) {
            prompt = template.stringify(question);
        }

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
                return {
                    revisedTitle: answer.RQ || question,
                    sqlCanAnswer: answer.sqlCanAnswer == null ? true : answer.sqlCanAnswer,
                    notClear: answer.notClear,
                    assumption: answer.assumption,
                    combinedTitle: answer.CQ || question,
                    sql: answer.sql,
                    chart: answer.chart ? {
                        chartName: answer.chart.chartName,
                        title: answer.chart.title,
                        ...this.removeTableNameForColumn(answer.chart.options)
                    } : null,
                    questions: answer.questions || [],
                }
            } else {
                return null;
            }
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                this.log.error({ err, choice }, `Failed to parse the answer for question: ${question}`);
                throw new BotResponseParseError('Failed to parse the answer.', choice, err);
            } else {
                this.log.error({ err }, `Failed to get answer for question: ${question}`);
                throw new BotResponseGenerateError(`Failed to generate the answer.`, err);
            }
        }
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
