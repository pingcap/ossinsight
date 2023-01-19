import {AIModel, PromptTemplate} from "../types";

export class GenerateSQLPromptTemplate implements PromptTemplate {

  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['---'];
  public maxTokens: number = 300;
  public temperature: number = 0.8;
  public topP: number = 1;
  public n: number = 1;

  stringify(question: string, context: Record<string, any>): string {

    return ` MySQL SQL
Table github_events, columns = [id, type, created_at, repo_id, repo_name, actor_id, actor_login, additions, deletions, action, number, org_login, org_id, state, closed_at, comments, pr_merged_at, pr_merged, pr_changed_files, pr_review_comments, pr_or_issue_id, push_size, push_distinct_size, creator_user_login, creator_user_id, pr_or_issue_created_at]
- Column type, enums = ['PullRequestEvent', 'PushEvent', 'IssueCommentEvent', 'IssuesEvent', 'PullRequestReviewCommentEvent', 'WatchEvent', 'CreateEvent', 'DeleteEvent', 'ForkEvent', 'ReleaseEvent']
- Column action:
* type in [PullRequestReviewCommentEvent, IssueCommentEvent, ReviewEvent]: created
* type in [PullRequestEvent, IssuesEvent]: opened, closed, reopened
- Column number, number is issue number
- Column created_at, closed_at, pr_merged_at, pr_or_issue_created_at DEFAULT '1970-01-01 00:00:00'

# Rules
Select statement limit 20 by default, if question need more data, please add limit 200
Use column alias for all columns: SELECT ge.repo_name AS repo_name
use common table expression if and only if necessary

# Snippet
Trends across months: DATE_FORMAT(ge.created_at, '%Y-%m-01') AS t_month
Open to merged time: TIMESTAMPDIFF(SECOND, ge.pr_or_issue_created_at, ge.closed_at)
Exclude bots: actor_login NOT LIKE "%bot%"
When access github_events table, must add 'repo_id = {fill with repo_id!!!}' in WHERE
Star in 2022: WHERE ge.type = 'WatchEvent' AND ge.action = 'started' AND YEAR(ge.created_at) = 2022
Merged PR: type = 'PullRequestEvent' AND action = 'closed' AND pr_merged = 1
The number of PR: type = 'PullRequestEvent' AND action = 'opened'
Contributor: who opened pull request to the repo

# Context
${context.repo_id ? `this_repo_id = ${context.repo_id}` : ''}
${context.repo_name ? `this_repo_name = ${context.repo_name}` : ''}
${context.github_id ? `my_github_id = ${context.github_id}` : ''}
${context.github_login ? `my_github_login = ${context.github_login}` : ''}

# Example Template
-- A template for calculating trend by star history
SELECT DATE_FORMAT(ge.created_at, '%Y-%m-01') AS month, COUNT(*) AS stars FROM github_events ge WHERE ge.type = 'WatchEvent' AND ge.repo_id = ${context.repo_id} GROUP BY month ORDER BY month ASC

---
Let's think step by step, use best practice of writing SQL, generate a single line SQL (without line break) to answer the question: "${question}".
---
`
  }

}