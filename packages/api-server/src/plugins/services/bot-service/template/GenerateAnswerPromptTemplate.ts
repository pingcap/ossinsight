import {AIModel, PromptTemplate} from "../types";

export class GenerateAnswerPromptTemplate implements PromptTemplate {
  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 400;
  public temperature: number = 0;
  public topP: number = 1;
  public n: number = 1;
  public logprobs: number = 2;

  stringify(question: string): string {
    return `# MySQL SQL
Table github_events, columns = [id, type, created_at, repo_id, repo_name, actor_id, actor_login, language, additions, deletions, action, number, org_login, org_id, state, closed_at, comments, pr_merged_at, pr_merged, pr_changed_files, pr_review_comments, pr_or_issue_id, push_size, push_distinct_size, creator_user_login, creator_user_id, pr_or_issue_created_at]
Column type, enums = ['PullRequestEvent', 'PushEvent', 'IssueCommentEvent', 'IssuesEvent', 'PullRequestReviewCommentEvent', 'WatchEvent', 'CreateEvent', 'DeleteEvent', 'ForkEvent', 'ReleaseEvent']
Column number, number is issue number
Table github_repos, columns = [repo_id, repo_name, owner_id, owner_login, owner_is_org, description, primary_language, license, size, stars, forks, parent_repo_id, is_fork, is_archived, is_deleted, latest_released_at, pushed_at, created_at, updated_at]
Column primary_language means programming language, invalid = [null, '']
Table github_users, columns = [id, login, type, name, organization, country_code, followers, followings, created_at, updated_at]
Column type, enums = ['USR', 'ORG']
Column country_code, invalid = ['', 'N/A', 'UND']
Table collections, columns = [id, name]
Table collection_items, columns = [collection_id, repo_id, repo_name]
Table trending_repos, columns = [repo_name, created_at]
Table github_repo_topics, columns = [repo_id, topic]

# Relations
collections.id = collection_items.collection_id
collection_items.repo_id = github_repos.repo_id
github_events.repo_id = github_repos.repo_id
github_events.repo_name = github_repos.repo_name
github_events.actor_id = github_users.id
github_events.actor_login = github_users.login
github_events.creator_user_id = github_users.id
github_repos.owner_id = github_users.id
github_repos.repo_id = github_repo_topics.repo_id
trending_repos.repo_name = github_repos.repo_name

Select statement limit 20 by default, if question need more data, please add limit 200
When type = 'PullRequestReviewCommentEvent' or type = 'IssueCommentEvent', the action could be 'created'
When type = 'PullRequestEvent' or type = 'IssuesEvent', the action could be 'opened', 'closed'
When type = 'PullRequestEvent', action = 'closed' and pr_merged = 1, it means the pull request is merged
PushEvent: trigger when commit has been pushed
Return the link column for PR / issue list: SELECT CONCAT('https://github.com/', repo_name, '/issues/', number) AS link
Exclude bots: WHERE actor_login NOT LIKE "%bot%"
Contributor: the person who opened pull request to the repo, it will trigger a PullRequestEvent
The most popular repos has the most stars,
Similar repositories will have similar topics, or be in the same collection, order by the similarity
collection is a categorization of some similar repositories, but not all repositories have a corresponding collection
The trending_repos table contains the most recent and popular repositories

-- @pingcap/tidb cumulative stars across months
SELECT t_month, stars, SUM(stars) OVER(ORDER BY t_month ASC) AS cumulative_stars FROM ( SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS t_month, COUNT(*) AS stars FROM github_events ge WHERE ge.type = 'WatchEvent' AND ge.repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = 'pingcap/tidb') AND ge.created_at != '1970-01-01 00:00:00' GROUP BY t_month ) star_counts ORDER BY t_month ASC;

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
  // MySQL SQL
  sql: string;
  chart: { chartName: string; title: string; } & ChartOptions;
  // Give 2 questions, a similar question and a creative and different question
  questions?: string[];
}

---
Let's think step by step, use best practice of writing SQL, generate a answer.json file to answer the question: ${question}?
---
answer.json
---
`;
  }

}
