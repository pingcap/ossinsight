WITH prs_with_language AS (
    SELECT
        language, COUNT(1) AS cnt
    FROM github_events ge
    WHERE
        type = 'PullRequestEvent'
        AND actor_id = 5086433
        AND action = 'opened'
        AND language IS NOT NULL
    GROUP BY language
), s AS (
    SELECT SUM(cnt) AS total FROM prs_with_language
)
SELECT
    language,
    cnt AS prs,
    cnt / s.total AS percentage
FROM prs_with_language, s
ORDER BY prs DESC