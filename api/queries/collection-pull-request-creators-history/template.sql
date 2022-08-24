WITH pr_opened AS (
    SELECT
        event_month,
        actor_login,
        repo_id,
        repo_name,
        number,
        created_at
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND action = 'opened'
        AND repo_id IN (41986369, 16563587, 105944401)
), pr_merged AS (
    SELECT
        number
    FROM github_events
    WHERE
        type = 'PullRequestEvent'
        AND action = 'closed'
        AND pr_merged = true
        AND repo_id IN (41986369, 16563587, 105944401)
), pr_creators_with_latest_repo_name AS (
    SELECT
        event_month,
        actor_login,
        FIRST_VALUE(repo_name) OVER (PARTITION BY repo_id ORDER BY created_at DESC) AS repo_name,
        ROW_NUMBER() OVER(PARTITION BY repo_id, actor_login) AS row_num
    FROM pr_opened po
    JOIN pr_merged pm ON po.number = pm.number
), acc AS (
    SELECT
        event_month,
        repo_name,
        COUNT(actor_login) OVER(PARTITION BY repo_name ORDER BY event_month ASC) AS total
    FROM pr_creators_with_latest_repo_name
    WHERE row_num = 1
    ORDER BY 1
)
SELECT event_month, repo_name, ANY_VALUE(total) AS total
FROM acc
GROUP BY 1, 2
ORDER BY 1
;