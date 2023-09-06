WITH repos AS (
    SELECT
        gr.repo_id, gr.repo_name
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
)
SELECT
    IF(gu.country_code IN ('', 'N/A', 'UND'), 'UND', gu.country_code) AS country_code,
    COUNT(*) AS stars
FROM github_events ge
JOIN github_users gu ON ge.actor_login = gu.login
WHERE
    ge.repo_id IN (SELECT repo_id FROM repos)
    AND ge.type = 'WatchEvent'
    AND ge.action = 'started'
    {% case period %}
        {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 12 MONTH)
    {% endcase %}
GROUP BY gu.country_code
ORDER BY stars DESC
LIMIT {{ n }}
