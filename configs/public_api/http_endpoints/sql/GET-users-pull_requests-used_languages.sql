USE gharchive_dev;

WITH user AS (
    SELECT id AS user_id
    FROM github_users
    WHERE login = ${username}
    LIMIT 1
), prs_with_languages AS (
    SELECT
        gr.primary_language AS language, COUNT(1) AS cnt
    FROM github_events ge
    LEFT JOIN github_repos gr ON ge.repo_id = gr.repo_id
    WHERE
        type = 'PullRequestEvent'
        AND actor_id = (SELECT user_id FROM user)
        AND action = 'opened'
        AND gr.primary_language != ''
        AND ge.created_at >= ${from}
        AND ge.created_at <= ${to}
    GROUP BY gr.primary_language
), s AS (
    SELECT SUM(cnt) AS total FROM prs_with_languages
)
SELECT
    language,
    cnt AS prs,
    cnt / s.total AS percentage
FROM prs_with_languages, s
ORDER BY prs DESC