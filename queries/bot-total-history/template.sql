WITH bots_with_first_seen AS (
    SELECT
        actor_login, MIN(event_month) AS first_seen_at
    FROM github_events ge
    WHERE
        actor_login REGEXP '^(bot-.+|.+bot|.+\\[bot\\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+)$'
    GROUP BY actor_login
    ORDER BY first_seen_at
),  acc AS (
    SELECT
        COUNT(actor_login) OVER (ORDER BY first_seen_at) AS cnt,
        first_seen_at AS event_month
    FROM
        bots_with_first_seen AS bwfs
    ORDER BY event_month
)
SELECT ANY_VALUE(cnt) AS bots_total, event_month
FROM acc
GROUP BY event_month
ORDER BY event_month