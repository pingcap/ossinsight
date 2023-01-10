import {AIModel, PromptTemplate} from "../types";

export class GenerateAnswerPromptTemplate implements PromptTemplate {
  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 800;
  public temperature: number = 0;
  public topP: number = 1;
  public n: number = 1;

  stringify(question: string): string {
    return `# MySQL SQL
Table github_events, columns = [id, type, created_at, repo_id, repo_name, actor_id, actor_login, additions, deletions, action, number, org_login, org_id, state, closed_at, comments, pr_merged_at, pr_merged, pr_changed_files, pr_review_comments, pr_or_issue_id, push_size, push_distinct_size, creator_user_login, creator_user_id, pr_or_issue_created_at]
Column type, enums = ['PullRequestEvent', 'PushEvent', 'IssueCommentEvent', 'IssuesEvent', 'PullRequestReviewCommentEvent', 'WatchEvent', 'CreateEvent', 'DeleteEvent', 'ForkEvent', 'ReleaseEvent']
Column number, number is issue number
Table github_repos, columns = [repo_id, repo_name, owner_id, owner_login, owner_is_org, description, primary_language, license, size, stars, forks, parent_repo_id, is_fork, is_archived, is_deleted, latest_released_at, pushed_at, created_at, updated_at]
Column primary_language means programming language, invalid = [null, '']
Table github_users, columns = [id, login, type, name, organization, country_code, followers, followings, created_at, updated_at]
Column type, enums = ['USR', 'ORG']
Column country_code, invalid = ['', 'N/A', 'UND']
Table trending_repos, columns = [repo_name, created_at]
Table github_repo_topics, columns = [repo_id, topic]

# Relations
github_events.repo_id = github_repos.repo_id
github_events.repo_name = github_repos.repo_name
github_events.actor_id = github_users.id
github_events.actor_login = github_users.login
github_events.creator_user_id = github_users.id
github_repos.owner_id = github_users.id
github_repos.repo_id = github_repo_topics.repo_id
trending_repos.repo_name = github_repos.repo_name

Select statement limit 20 by default, if question need more data, please add limit 50
When type = 'PullRequestReviewCommentEvent' or type = 'IssueCommentEvent', the action could be 'created'
When type = 'PullRequestEvent' or type = 'IssuesEvent', the action could be 'opened', 'closed'
When type = 'PullRequestEvent', action = 'closed' and pr_merged = 1, it means the pull request is merged
PushEvent: trigger when commit has been pushed
Return the link column for PR / issue list: SELECT CONCAT('https://github.com/', repo_name, '/issues/', number) AS link
Exclude bots: WHERE actor_login NOT LIKE "%bot%"
Database repos: WHERE github_repos.description LIKE '%database%'
Contributor: the person who opened pull request to the repo, it will trigger a PullRequestEvent
The most popular repos has the most stars
Similar repositories will have similar topics
The trending_repos table contains the most recent and popular repositories
Make sure to avoid ambiguous column references and non-existent columns by using table aliases and double-checking column names before running the query.

-- star history(trend) of pingcap/tidb
SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS month, COUNT(*) AS stars FROM github_events WHERE type = 'WatchEvent' AND repo_name = 'pingcap/tidb' GROUP BY month ORDER BY month ASC

# Format
@org_or_user_login
@org_or_user_login/repo_name

# ChartOptions
PieChart {label: Column; value: Column;}
LineChart {x: Column; y: Column | Column[];}
BarChart {x: Column; y: Column | Column[];}
MapChart {country_code: Column; value: Column;}
NumberCard {label?: Column; value: Column;}
RepoCard {repo_name: Column;}
PersonalCard {user_login: Column;}
Table {columns: Column[];}

Answer {
  sql: string; // single line sql
  chart: { chartName: string; title: string; } & ChartOptions;
  // Generate 2 distinct questions based on the given information, including 1 related to the provided one and 1 is random.
  questions: string[];
}

---
Let's think step by step, use best practice of writing SQL, use common table expression if and only if necessary, scan all repos if there is no specific repo, generate a answer.json file to answer the question: "${question}".(I want you think like God)
---
answer.json
---
`;
  }

}
