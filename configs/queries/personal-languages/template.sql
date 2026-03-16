WITH prs_with_language AS (
    SELECT
        gr.primary_language AS language, COUNT(1) AS cnt
    FROM github_events ge
    LEFT JOIN github_repos gr ON ge.repo_id = gr.repo_id
    WHERE
        type = 'PullRequestEvent'
        AND actor_id = 5086433
        AND action = 'opened'
        AND gr.primary_language IS NOT NULL  -- TODO: remove
        AND gr.primary_language != ''
        AND (ge.created_at BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW())
    GROUP BY gr.primary_language
), s AS (
    SELECT SUM(cnt) AS total FROM prs_with_language
)
SELECT
    language,
    cnt AS prs,
    cnt / s.total AS percentage
FROM prs_with_language, s
ORDER BY prs DESC