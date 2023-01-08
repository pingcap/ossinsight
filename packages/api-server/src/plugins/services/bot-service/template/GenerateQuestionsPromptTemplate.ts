import {AIModel, PromptTemplate} from "../types";

export class GenerateQuestionsPromptTemplate implements PromptTemplate {
  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 1000;
  public temperature: number = 0.75;
  public topP: number = 1;
  public n: number = 1;
  public logprobs: number = 2;

  stringify(n: number): string {
    const seed = Math.random();
    return `# Table Schema
Table github_events, columns = [id, type, created_at, repo_id, repo_name, actor_id, actor_login, additions, deletions, action, number, org_login, org_id, state, closed_at, comments, pr_merged_at, pr_merged, pr_changed_files, pr_review_comments, pr_or_issue_id, push_size, push_distinct_size, creator_user_login, creator_user_id, pr_or_issue_created_at]
Column type, enums = ['PullRequestEvent', 'PushEvent', 'IssueCommentEvent', 'IssuesEvent', 'PullRequestReviewCommentEvent', 'WatchEvent', 'CreateEvent', 'DeleteEvent', 'ForkEvent', 'ReleaseEvent']
Table github_repos, columns = [repo_id, repo_name, owner_id, owner_login, owner_is_org, description, primary_language, license, size, stars, forks, parent_repo_id, is_fork, is_archived, is_deleted, latest_released_at, pushed_at, created_at, updated_at]
Table github_users, columns = [id, login, type, name, organization, country_code, followers, followings, created_at, updated_at]
Column type, enums = ['USR', 'ORG']
Table collections, columns = [id, name]
Table collection_items, columns = [collection_id, repo_id, repo_name]
Table trending_repos, the recent popular repos, columns = [repo_name, created_at]
Table github_repo_topics, columns = [repo_id, topic]

Question {title: string}
seed: ${seed}

Please generate ${n} distinct questions based on the given information, including ${Math.floor(n/2)} from the perspective of developers and ${Math.ceil(n/2)} from the perspective of investors. These questions should be easy to answer with a SQL query and and should cover a range of topics, including specific repos, technical domains, and global trends,less than 25 words. Do not show perspective or sql or classification.
Let's think step by step, generate the Question array to the questions.json using compressed JSON format.
---
questions.json
---
`;
  }

}
