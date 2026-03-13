const TABLE_GUIDE = [
  "- github_events(id, type, created_at, repo_id, repo_name, actor_id, actor_login, additions, deletions, action, number, org_login, org_id, state, closed_at, comments, pr_merged_at, pr_merged, pr_changed_files, pr_review_comments, pr_or_issue_id, push_size, push_distinct_size, creator_user_login, creator_user_id, pr_or_issue_created_at)",
  "- github_repos(repo_id, repo_name, owner_id, owner_login, owner_is_org, description, primary_language, license, stars, forks, parent_repo_id, is_archived, is_deleted, latest_released_at, pushed_at, created_at, updated_at)",
  "- github_users(id, login, type, name, organization, country_code, followers, followings, created_at, updated_at)",
  "- github_repo_topics(repo_id, topic)",
  "- trending_repos(repo_name, created_at)",
];

const RELATION_GUIDE = [
  "- github_events.repo_id = github_repos.repo_id",
  "- github_events.actor_id = github_users.id",
  "- github_events.creator_user_id = github_users.id",
  "- github_repos.owner_id = github_users.id",
  "- github_repo_topics.repo_id = github_repos.repo_id",
  "- trending_repos.repo_name = github_repos.repo_name",
];

const DOMAIN_GUIDE = [
  "- stars = github_events.type = 'WatchEvent' and action = 'started'",
  "- opened pull requests = type = 'PullRequestEvent' and action = 'opened'",
  "- merged pull requests = type = 'PullRequestEvent' and action = 'closed' and pr_merged = 1",
  "- issue comments = type = 'IssueCommentEvent' and action = 'created'",
  "- repo_name is the canonical owner/repo identifier",
  "- github_users.type uses 'USR' for people and 'ORG' for organizations",
  "- month trends should usually use DATE_FORMAT(created_at, '%Y-%m-01')",
  "- when the question says developers, people, or users, prefer github_users.type = 'USR'",
  "- when the question says organizations or orgs, prefer github_users.type = 'ORG'",
];

const SQL_RULES = [
  "- output exactly one SELECT statement or one WITH ... SELECT statement",
  "- never emit INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, RENAME, GRANT, REVOKE, SHOW, SET, USE, EXPLAIN, DESCRIBE, CALL, HANDLER, LOAD, LOCK, UNLOCK",
  "- never reference tables or columns outside the schema above",
  "- prefer stable snake_case aliases for every returned column",
  "- prefer concise aggregates over raw event dumps",
  "- default LIMIT is 50 and the hard maximum is 200",
  "- if the user asks for a comparison, use aligned category or time columns",
  "- if the question is ambiguous, make at most 4 short assumptions and keep the query safe",
];

const VIS_RULES = [
  "- choose one chart kind from: bar, line, area, pie, metric, table",
  "- every chart key must exactly match a SQL result alias",
  "- metric is only for a single-row result with one main numeric value",
  "- line and area are for time or ordered series",
  "- pie is only for one category column and one numeric column",
  "- fall back to table if the result shape does not cleanly fit a chart",
];

const OUTPUT_RULES = [
  "- revisedQuestion should be a concise rewrite of the user question",
  "- keywords should contain 3 to 6 short GitHub-related phrases extracted from the question",
  "- subQuestions should contain 1 to 4 short planning questions that help derive the SQL",
  "- combinedQuestion should be the polished final question after adding the needed GitHub scope",
  "- summary should describe what the query is intended to show, not the actual findings",
  "- assumptions must be short, concrete, and optional",
  "- sql must be directly executable against TiDB MySQL compatibility mode",
];

export function buildExplorerPlanningPrompt(question: string) {
  return [
    "You are planning a one-turn answer for OSSInsight Data Explorer.",
    "Return a structured plan that generates one readonly SQL query and one preset chart configuration.",
    "",
    "Available tables:",
    ...TABLE_GUIDE,
    "",
    "Relations:",
    ...RELATION_GUIDE,
    "",
    "GitHub domain rules:",
    ...DOMAIN_GUIDE,
    "",
    "SQL guardrails:",
    ...SQL_RULES,
    "",
    "Visualization rules:",
    ...VIS_RULES,
    "",
    "Response rules:",
    ...OUTPUT_RULES,
    "",
    "Question:",
    question,
  ].join("\n");
}
