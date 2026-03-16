WITH repos AS (
    SELECT
        gr.repo_id, gr.repo_name
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), stars_overview AS (
    SELECT
        SUM(IF(gu.organization_formatted IS NOT NULL AND LENGTH(gu.organization_formatted) != 0, 1, 0)) AS stars_with_org,
        COUNT(*) AS stars_total
    FROM github_events ge
    JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type = 'WatchEvent'
        AND ge.action = 'started'
        {% if excludeBots %}
        -- Exclude bot users.
        AND ge.actor_login NOT LIKE '%bot%'
        {% endif %}
        {% case period %}
            {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
)
SELECT
    ROUND(so.stars_with_org / so.stars_total * 100, 2) AS percentage
FROM
    stars_overview so
