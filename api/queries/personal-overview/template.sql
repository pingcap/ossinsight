WITH logins AS (
    SELECT DISTINCT actor_login
    FROM github_events ge
    WHERE actor_id = 5086433
), latest_login AS (
    SELECT actor_login As login
    FROM github_events ge
    WHERE actor_id = 5086433
    ORDER BY created_at DESC
    LIMIT 1
), repos AS (
    SELECT DISTINCT repo_id, repo_name
    FROM github_events ge
    WHERE ge.actor_id = 5086433 AND repo_name LIKE CONCAT(actor_login, '%') AND repo_id IS NOT NULL
), star_repos AS (
    SELECT COUNT(DISTINCT repo_id) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'WatchEvent'
), star_earned AS (
    SELECT COUNT(id) AS cnt
    FROM github_events ge
    WHERE repo_id IN (SELECT repo_id FROM repos) AND type = 'WatchEvent'
), contribute_repos AS (
    SELECT COUNT(DISTINCT repo_id) AS cnt
    FROM github_events ge
    WHERE
        actor_id = 5086433
        AND type IN ('IssuesEvent', 'PullRequestEvent', 'PullRequestReviewEvent', 'PushEvent')
        AND repo_id NOT IN (SELECT repo_id FROM repos)
), issues AS (
    SELECT 5086433 AS user_id, COUNT(DISTINCT pr_or_issue_id) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'IssuesEvent' AND action = 'opened'
), pull_requests AS (
    SELECT 5086433 AS user_id, COUNT(DISTINCT pr_or_issue_id) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'PullRequestEvent' AND action = 'opened'
), code_reviews AS (
    SELECT COUNT(DISTINCT pr_or_issue_id) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'PullRequestReviewEvent' AND action = 'created'
), code_additions AS (
    SELECT SUM(additions) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'PullRequestEvent' AND action = 'closed' AND pr_merged = true
), code_deletions AS (
    SELECT SUM(deletions) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'PullRequestEvent' AND action = 'closed' AND pr_merged = true
)
SELECT
    5086433 AS user_id,
    (SELECT login FROM latest_login) AS latest_login,
    (SELECT GROUP_CONCAT(actor_login) FROM logins) AS user_logins,
    (SELECT COUNT(DISTINCT repo_id) FROM repos) AS repos,
    (SELECT cnt FROM star_repos) AS star_repos,
    (SELECT cnt FROM star_earned) AS star_earned,
    (SELECT cnt FROM contribute_repos) AS contribute_repos,
    (SELECT cnt FROM issues) AS issues,
    (SELECT cnt FROM pull_requests) AS pull_requests,
    (SELECT cnt FROM code_reviews) AS code_reviews,
    (SELECT cnt FROM code_additions) AS code_additions,
    (SELECT cnt FROM code_deletions) AS code_deletions