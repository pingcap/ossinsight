USE gharchive_dev;

WITH user AS (
    SELECT id AS user_id
    FROM github_users
    WHERE login = ${username}
    LIMIT 1
), repo_ids AS (
    SELECT repo_id FROM github_repos gr WHERE gr.owner_id = (SELECT user_id FROM user)
), repos AS (
    SELECT COUNT(repo_id) AS cnt FROM repo_ids
), star_repos AS (
    SELECT COUNT(DISTINCT repo_id) AS cnt
    FROM github_events ge
    WHERE 
        actor_id = (SELECT user_id FROM user) 
        AND type = 'WatchEvent'
        AND created_at >= ${from}
        AND created_at <= ${to}
), star_earned AS (
    SELECT COUNT(1) AS cnt
    FROM github_events ge
    WHERE 
        repo_id IN (SELECT repo_id FROM repo_ids) 
        AND type = 'WatchEvent' 
        AND created_at >= ${from}
        AND created_at <= ${to}
), contribute_repos AS (
    SELECT
      COUNT(DISTINCT repo_id) AS cnt
    FROM github_events ge
    WHERE
        actor_id = (SELECT user_id FROM user)
        AND (
            (type = 'PullRequestEvent' AND action = 'opened') OR
            (type = 'IssuesEvent' AND action = 'opened') OR
            (type = 'PullRequestReviewEvent' AND action = 'created') OR
            (type = 'PushEvent' AND action = '')
        )
        AND repo_id NOT IN (SELECT repo_id FROM repo_ids)
        AND created_at >= ${from}
        AND created_at <= ${to}
), issues AS (
    SELECT
        COUNT(1) AS cnt
    FROM github_events ge
    WHERE 
        actor_id = (SELECT user_id FROM user) 
        AND type = 'IssuesEvent' 
        AND action = 'opened' 
        AND created_at >= ${from}
        AND created_at <= ${to}
), pull_requests AS (
    SELECT
        COUNT(1) AS cnt
    FROM github_events ge
    WHERE 
        actor_id = (SELECT user_id FROM user) 
        AND type = 'PullRequestEvent' 
        AND action = 'opened' 
        AND created_at >= ${from}
        AND created_at <= ${to}
), code_reviews AS (
    SELECT
        COUNT(1) AS cnt
    FROM github_events ge
    WHERE 
        actor_id = (SELECT user_id FROM user) 
        AND type = 'PullRequestReviewEvent' 
        AND action = 'created' 
        AND created_at >= ${from}
        AND created_at <= ${to}
), code_changes AS (
    SELECT
        SUM(additions) AS additions,
        SUM(deletions) AS deletions
    FROM github_events ge
    WHERE 
        type = 'PullRequestEvent' 
        AND action = 'closed' 
        AND pr_merged = true 
        AND creator_user_id = (SELECT user_id FROM user) 
        AND created_at >= ${from}
        AND created_at <= ${to}
)
SELECT
    u.user_id,
    IFNULL(r.cnt, 0) AS repos,
    IFNULL(sr.cnt, 0) AS star_repos,
    IFNULL(se.cnt, 0) AS star_earned,
    IFNULL(cr.cnt, 0) AS contribute_repos,
    IFNULL(i.cnt, 0) AS issues,
    IFNULL(pr.cnt, 0) AS pull_requests,
    IFNULL(re.cnt, 0) AS code_reviews,
    IFNULL(cc.additions, 0) AS code_additions,
    IFNULL(cc.deletions, 0) AS code_deletions
FROM user u
LEFT JOIN repos r ON 1 = 1
LEFT JOIN star_repos sr ON 1 = 1
LEFT JOIN star_earned se ON 1 = 1
LEFT JOIN contribute_repos cr ON  1 = 1
LEFT JOIN issues i ON 1 = 1
LEFT JOIN pull_requests pr ON 1 = 1
LEFT JOIN code_reviews re ON 1 = 1
LEFT JOIN code_changes cc ON 1 = 1
;