import {AIModel, PromptTemplate} from "../types";

export class GenerateQuestionsPromptTemplate implements PromptTemplate {
  // AI Model Parameters.
  public model: AIModel = AIModel.TEXT_DAVINCI_003;
  public stop: string[] = ['#', '---'];
  public maxTokens: number = 400;
  public temperature: number = 0;
  public topP: number = 0.4;
  public n: number = 1;
  public logprobs: number = 2;

  stringify(n: number): string {
    const seed = Math.random();
    return `# Table Schema
Table github_events, columns = [id, type, created_at, repo_id, repo_name, actor_id, actor_login, language, additions, deletions, action, number, org_login, org_id, state, closed_at, comments, pr_merged_at, pr_merged, pr_changed_files, pr_review_comments, pr_or_issue_id, push_size, push_distinct_size, creator_user_login, creator_user_id, pr_or_issue_created_at]
Column type, enums = ['PullRequestEvent', 'PushEvent', 'IssueCommentEvent', 'IssuesEvent', 'PullRequestReviewCommentEvent', 'WatchEvent', 'CreateEvent', 'DeleteEvent', 'ForkEvent', 'ReleaseEvent']
Table github_repos, columns = [repo_id, repo_name, owner_id, owner_login, owner_is_org, description, primary_language, license, size, stars, forks, parent_repo_id, is_fork, is_archived, is_deleted, latest_released_at, pushed_at, created_at, updated_at]
Table github_users, columns = [id, login, type, name, organization, country_code, followers, followings, created_at, updated_at]
Column type, enums = ['USR', 'ORG']
Table collections, columns = [id, name]
Table collection_items, columns = [collection_id, repo_id, repo_name]
Table trending_repos, the recent popular repos, columns = [repo_name, created_at]
Table github_repo_topics, columns = [repo_id, topic]

Question { title: string}
question could start with What, How, Who, Which, Does, Is, Are, List, Show and etc
seed: ${seed}

---
Let's think step by step, generate 5 random, valuable and interesting questions for developers / investors / contributors to questions.json
---
questions.json
---
`;
  }

}
