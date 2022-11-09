WITH repo_stars AS (
    SELECT
        repo_id,
        ANY_VALUE(repos.name) AS repo_name,
        COUNT(distinct actor_login) AS stars
    FROM github_events
         JOIN db_repos repos ON repos.id = github_events.repo_id
    WHERE type = 'WatchEvent'
    GROUP BY 1
), top_10_repos AS (
    SELECT
        repo_id, repo_name, stars
    FROM repo_stars rs
    ORDER BY stars DESC
    LIMIT 10
), tmp AS (
    SELECT
        event_year,
        tr.repo_name AS repo_name,
        COUNT(*) AS year_stars
    FROM github_events
         JOIN top_10_repos tr ON tr.repo_id = github_events.repo_id
    WHERE type = 'WatchEvent' AND event_year <= 2021
    GROUP BY 2, 1
    ORDER BY 1 ASC, 2
), tmp1 AS (
    SELECT
        event_year,
        repo_name,
        SUM(year_stars) OVER(partition by repo_name order by event_year ASC) as stars
    FROM tmp
    ORDER BY event_year ASC, repo_name
)
SELECT event_year, repo_name, stars FROM tmp1
