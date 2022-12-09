import { Configuration, OpenAIApi } from "openai";

import fp from "fastify-plugin";
import pino from "pino";

declare module 'fastify' {
  interface FastifyInstance {
      botService: BotService;
  }
}

export default fp(async (fastify) => {
    const log = fastify.log.child({ service: 'bot-service'}) as pino.Logger;
    fastify.decorate('botService', new BotService(log, fastify.config.OPENAI_API_KEY));
}, {
  name: 'bot-service',
  dependencies: []
});

export enum AIModel {
    DAVINCI = 'text-davinci-002',
    CURIE = 'text-curie-001',
    BABBAGE = 'text-babbage-001',
    ADA = 'text-ada-001',
}

export interface QuestionContext {
    user_id?: number;
    user_login?: string;
    repo_id?: number;
    repo_name?: string;
}

export class BotService {
    private readonly openai: OpenAIApi;

    constructor(
        private readonly log: pino.Logger,
        private readonly apiKey: string
    ) {
        const configuration = new Configuration({
            apiKey: this.apiKey
        });
        this.openai = new OpenAIApi(configuration);
    }

    // TODO: store the prompt template to the config file.
    private getSQLPrompt(question: string, context: QuestionContext): string {
        const { user_id, user_login, repo_id, repo_name } = context;
        const defineCurrentRepoId = repo_id && repo_name ? `Describe: this_repo_id =  ${repo_id}, this_repo_name =  '${repo_name}'` : '';
        const defineMyUserId = user_id && user_login ? `Describe: my_user_id = ${user_id}, my_user_login = '${user_login}'` : '';
        const createIssueExample = repo_id && user_login ? `
# Example: How many issues did I created in pingcap/tidb in last three months
SELECT COUNT(*)
FROM github_events
WHERE
    type = 'IssuesEvent'
    AND action = 'opened'
    AND actor_login = '${user_login}'
    AND created_at > DATE_SUB(NOW(), INTERVAL 3 MONTH)
    AND repo_id = ${repo_id}
`: '';
        const whoAmIExample = user_login ? `
# Example: Who am I
SELECT '${user_login}' AS user_login;
` : ''
        const judgementExample = repo_id && user_login ? `
# Example: Am I a contributor to this repo?
SELECT CASE sub.prs > 0 WHEN TRUE THEN 'Yes' ELSE 'No' END AS is_contributor FROM (SELECT COUNT(*) AS prs FROM github_events WHERE type = 'PullRequestEvent' AND action = 'opened' AND repo_id = ${repo_id} AND actor_login = '${user_login}') AS sub;
` : '';

        return `# MySQL SQL
---
Table github_events, columns = [id, type, created_at, repo_id, repo_name, actor_id, actor_login, language, additions, deletions, action, number, org_login, org_id, state, closed_at, comments, pr_merged_at, pr_merged, pr_changed_files, pr_review_comments, pr_or_issue_id, push_size, push_distinct_size, creator_user_login, creator_user_id, pr_or_issue_created_at]
Table github_repos, columns = [repo_id, repo_name, owner_id, owner_login, owner_is_org, description, primary_language, license, size, stars, forks, parent_repo_id, is_fork, is_archived, is_deleted, latest_released_at, pushed_at, created_at, updated_at]
Relation github_events.repo_id = github_repos.repo_id
Define github_events.type = [PushEvent, PullRequestEvent, IssueCommentEvent, IssuesEvent, CreateEvent, ForkEvent, PullRequestReviewCommentEvent, PullRequestReviewEvent, ReleaseEvent, WatchEvent]
${defineCurrentRepoId}
${defineMyUserId}
---
${createIssueExample}
---
${whoAmIExample}
---
${judgementExample}
---
# Question: 
# ${question}
---
SELECT`;
    }

    async questionToSQL(question: string, context: QuestionContext): Promise<string | null> {
        if (!question) return null;
        const prompt = this.getSQLPrompt(question, context);
        this.log.info(prompt, `Get completion for question: ${question}`);
        const res = await this.openai.createCompletion({
            model: AIModel.DAVINCI,
            prompt,
            stream: false,
            stop: ['#', '---'],
            temperature: 0.3,
            max_tokens: 100,
            top_p: 0.4,
            n: 1,
            logprobs: 2,
        });

        const { choices, usage } = res.data;
        this.log.info(usage, 'OpenAI API usage');

        if (Array.isArray(choices)) {
            return `SELECT ${choices[0]?.text}`;
        } else {
            return null;
        }
    }

}
