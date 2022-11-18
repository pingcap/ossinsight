WITH contribution_group_by_type AS (
    SELECT repo_id, repo_name, contribute_type, cnt
    FROM (
        SELECT
            ROW_NUMBER() OVER (PARTITION BY repo_id, type) AS row_num,
            repo_id,
            FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id, type ORDER BY created_at DESC) AS repo_name,
            CASE type
                WHEN 'IssuesEvent' THEN 'issues'
                WHEN 'IssueCommentEvent' THEN 'issue_comments'
                WHEN 'PullRequestEvent' THEN 'pull_requests'
                WHEN 'PullRequestReviewEvent' THEN 'reviews'
                WHEN 'PullRequestReviewCommentEvent' THEN 'review_comments'
                WHEN 'PushEvent' THEN 'pushes'
            END AS contribute_type,
            COUNT(*) OVER (PARTITION BY repo_id, type) AS cnt
        FROM
            github_events ge
        WHERE
            created_at BETWEEN DATE_SUB(NOW(), INTERVAL 3 YEAR) AND NOW()
            AND (
                (type = 'PullRequestEvent' AND action = 'opened') OR
                (type = 'IssuesEvent' AND action = 'opened') OR
                (type = 'IssueCommentEvent' AND action = 'created') OR
                (type = 'PullRequestReviewEvent' AND action = 'created') OR
                (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
                (type = 'PushEvent')
            )
            AND actor_login IN ('Mini256', 'hooopo', 'sykp241095', '634750802', 'ChenlingLu')
    ) sub
    WHERE row_num = 1
), contributions_all AS (
    SELECT repo_id, repo_name, contribute_type, cnt
    FROM (
        SELECT
            ROW_NUMBER() OVER (PARTITION BY repo_id) AS row_num,
            repo_id,
            FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name,
            'all' AS contribute_type,
            COUNT(*) OVER (PARTITION BY repo_id) AS cnt
        FROM
            github_events ge
        WHERE
            created_at BETWEEN DATE_SUB(NOW(), INTERVAL 3 YEAR) AND NOW()
            AND (
                (type = 'PullRequestEvent' AND action = 'opened') OR
                (type = 'IssuesEvent' AND action = 'opened') OR
                (type = 'IssueCommentEvent' AND action = 'created') OR
                (type = 'PullRequestReviewEvent' AND action = 'created') OR
                (type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
                (type = 'PushEvent')
            )
            AND actor_login IN ('Mini256', 'hooopo', 'sykp241095', '634750802', 'ChenlingLu')
    ) sub
    WHERE row_num = 1
), contributions AS (
    SELECT * 
    FROM contributions_all ca
    UNION
    SELECT * 
    FROM contribution_group_by_type cgt
)
SELECT
    repo_id,
    ANY_VALUE(repo_name) AS repo_name,
    SUM(CASE contribute_type WHEN 'all' THEN cnt ELSE 0 END) AS contributions,
    SUM(CASE contribute_type WHEN 'pushes' THEN cnt ELSE 0 END) AS pushes,
    SUM(CASE contribute_type WHEN 'pull_requests' THEN cnt ELSE 0 END) AS pull_requests,
    SUM(CASE contribute_type WHEN 'reviews' THEN cnt ELSE 0 END) AS reviews,
    SUM(CASE contribute_type WHEN 'review_comments' THEN cnt ELSE 0 END) AS review_comments,
    SUM(CASE contribute_type WHEN 'issues' THEN cnt ELSE 0 END) AS issues,
    SUM(CASE contribute_type WHEN 'issue_comments' THEN cnt ELSE 0 END) AS issue_comments
FROM
    contributions
GROUP BY repo_id
ORDER BY contributions DESC
LIMIT 200000, 100000;