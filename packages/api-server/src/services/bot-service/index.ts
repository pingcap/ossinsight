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
    private getSQLPrompt(question: string): string {
        return `# MySQL SQL
---
Table github_events, columns = [id, type, created_at, repo_id, repo_name, actor_id, actor_login, language, additions, deletions, action, number, commit_id, comment_id, org_login, org_id, state, closed_at, comments, pr_merged_at, pr_merged, pr_changed_files, pr_review_comments, pr_or_issue_id, push_size, push_distinct_size, creator_user_login, creator_user_id, pr_or_issue_created_at]
Table github_repos, columns = [repo_id, repo_name, owner_id, owner_login, owner_is_org, description, primary_language, license, size, stars, forks, parent_repo_id, is_fork, is_archived, is_deleted, latest_released_at, pushed_at, created_at, updated_at, last_event_at, refreshed_at]
Relation github_events.repo_id = github_repos.repo_id
Define github_events.type = [PushEvent, PullRequestEvent, IssueCommentEvent, IssuesEvent, CreateEvent, DeleteEvent, ForkEvent, PullRequestReviewCommentEvent, PullRequestReviewEvent, ReleaseEvent, WatchEvent]
Describe: repo, [args:VALUE], repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = '%VALUE%' LIMIT 1)
# Example: How many issues does the repository pingcap/tidb has?
SELECT COUNT(*) FROM github_events WHERE type = 'IssuesEvent' AND repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = 'pingcap/tidb' LIMIT 1)
# Example: Who is the person submitted the most pull requests?
SELECT actor_login, COUNT(*) AS count FROM github_events WHERE type = 'PullRequestEvent' AND action = 'opened' GROUP BY actor_login ORDER BY count DESC LIMIT 1
---
# Question: 
# ${question}
---
SELECT`;
    }

    async questionToSQL(question?: string): Promise<string | undefined> {
        if (!question) return undefined;
        const prompt = this.getSQLPrompt(question);
        this.log.info(prompt, `Get completion for question: ${question}`);
        const res = await this.openai.createCompletion({
            model: AIModel.DAVINCI,
            prompt,
            stream: false,
            stop: ['#', '---'],
            temperature: 0.3,
            max_tokens: 400,
            top_p: 0.4,
            n: 1,
            logprobs: 2,
        });

        const { choices, usage } = res.data;
        this.log.info(usage, 'OpenAI API usage');

        if (Array.isArray(choices)) {
            return `SELECT ${choices[0]?.text}`;
        } else {
            return undefined;
        }
    }

}
