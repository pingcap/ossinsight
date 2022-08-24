WITH repos AS (
    SELECT DISTINCT repo_id
    FROM github_events ge
    WHERE
        ge.actor_id = 5086433
        AND type = 'CreateEvent'
        AND repo_name LIKE CONCAT(actor_login, '%')
        AND repo_id IS NOT NULL
), star_repos AS (
    SELECT COUNT(DISTINCT repo_id) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'WatchEvent'
), star_earned AS (
    SELECT COUNT(1) AS cnt
    FROM github_events ge
    WHERE repo_id IN (SELECT repo_id FROM repos) AND type = 'WatchEvent'
), contribute_repos AS (
    SELECT COUNT(DISTINCT repo_id) AS cnt
    FROM github_events ge
    WHERE
        actor_id = 5086433
        AND (
            (type = 'PullRequestEvent' AND action = 'opened') OR
            (type = 'IssuesEvent' AND action = 'opened') OR
            (type = 'PullRequestReviewEvent' AND action = 'created') OR
            (type = 'PushEvent' AND action IS NULL)
        )
        AND repo_id NOT IN (SELECT repo_id FROM repos)
), issues AS (
    SELECT 5086433 AS user_id, COUNT(1) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'IssuesEvent' AND action = 'opened'
), pull_requests AS (
    SELECT 5086433 AS user_id, COUNT(1) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'PullRequestEvent' AND action = 'opened'
), code_reviews AS (
    SELECT COUNT(1) AS cnt
    FROM github_events ge
    WHERE actor_id = 5086433 AND type = 'PullRequestReviewEvent' AND action = 'created'
), code_changes AS (
    SELECT SUM(additions) AS additions, SUM(deletions) AS deletions
    FROM github_events ge
    WHERE type = 'PullRequestEvent' AND action = 'closed' AND pr_merged = true AND creator_user_id = 5086433
)
SELECT
    5086433 AS user_id,
    (SELECT COUNT(DISTINCT repo_id) FROM repos) AS repos,
    (SELECT cnt FROM star_repos) AS star_repos,
    (SELECT cnt FROM star_earned) AS star_earned,
    (SELECT cnt FROM contribute_repos) AS contribute_repos,
    (SELECT cnt FROM issues) AS issues,
    (SELECT cnt FROM pull_requests) AS pull_requests,
    (SELECT cnt FROM code_reviews) AS code_reviews,
    (SELECT additions FROM code_changes) AS code_additions,
    (SELECT deletions FROM code_changes) AS code_deletions