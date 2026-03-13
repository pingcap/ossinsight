WITH repo_ids AS (
    SELECT repo_id FROM github_repos gr WHERE gr.owner_id = 5086433
), repos AS (
    SELECT 5086433 AS user_id, COUNT(repo_id) AS cnt FROM repo_ids
), star_repos AS (
    SELECT 5086433 AS user_id, COUNT(DISTINCT repo_id) AS cnt
    FROM github_events ge
    WHERE 
        actor_id = 5086433 
        AND type = 'WatchEvent' 
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
), star_earned AS (
    SELECT 5086433 AS user_id, COUNT(1) AS cnt
    FROM github_events ge
    WHERE 
        repo_id IN (SELECT repo_id FROM repo_ids) 
        AND type = 'WatchEvent' 
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
), contribute_repos AS (
    SELECT 5086433 AS user_id, COUNT(DISTINCT repo_id) AS cnt
    FROM github_events ge
    WHERE
        actor_id = 5086433
        AND (
            (type = 'PullRequestEvent' AND action = 'opened') OR
            (type = 'IssuesEvent' AND action = 'opened') OR
            (type = 'PullRequestReviewEvent' AND action = 'created') OR
            (type = 'PushEvent' AND action = '')
        )
        AND repo_id NOT IN (SELECT repo_id FROM repo_ids)
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
), issues AS (
    SELECT 5086433 AS user_id, COUNT(1) AS cnt
    FROM github_events ge
    WHERE 
        actor_id = 5086433 
        AND type = 'IssuesEvent' 
        AND action = 'opened' 
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
), pull_requests AS (
    SELECT 5086433 AS user_id, COUNT(1) AS cnt
    FROM github_events ge
    WHERE 
        actor_id = 5086433 
        AND type = 'PullRequestEvent' 
        AND action = 'opened' 
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
), code_reviews AS (
    SELECT 5086433 AS user_id, COUNT(1) AS cnt
    FROM github_events ge
    WHERE 
        actor_id = 5086433 
        AND type = 'PullRequestReviewEvent' 
        AND action = 'created' 
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
), code_changes AS (
    SELECT 5086433 AS user_id, SUM(additions) AS additions, SUM(deletions) AS deletions
    FROM github_events ge
    WHERE 
        type = 'PullRequestEvent' 
        AND action = 'closed' 
        AND pr_merged = true 
        AND creator_user_id = 5086433 
        AND (created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
)
SELECT
    sub.user_id,
    IFNULL(r.cnt, 0) AS repos,
    IFNULL(sr.cnt, 0) AS star_repos,
    IFNULL(se.cnt, 0) AS star_earned,
    IFNULL(cr.cnt, 0) AS contribute_repos,
    IFNULL(i.cnt, 0) AS issues,
    IFNULL(pr.cnt, 0) AS pull_requests,
    IFNULL(re.cnt, 0) AS code_reviews,
    IFNULL(cc.additions, 0) AS code_additions,
    IFNULL(cc.deletions, 0) AS code_deletions
FROM (
    SELECT 5086433 AS user_id
) sub
LEFT JOIN repos r ON sub.user_id = r.user_id
LEFT JOIN star_repos sr ON sub.user_id = sr.user_id
LEFT JOIN star_earned se ON sub.user_id = se.user_id
LEFT JOIN contribute_repos cr ON sub.user_id = cr.user_id
LEFT JOIN issues i ON sub.user_id = i.user_id
LEFT JOIN pull_requests pr ON sub.user_id = pr.user_id
LEFT JOIN code_reviews re ON sub.user_id = re.user_id
LEFT JOIN code_changes cc ON sub.user_id = cc.user_id
;