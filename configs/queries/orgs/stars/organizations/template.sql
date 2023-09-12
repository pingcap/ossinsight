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
    TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(gu.organization, ',', ''), '-', ''), '@', ''), 'www.', ''), 'inc', ''), '.com', ''), '.cn', ''), '.', '')) AS organization_name,
    COUNT(DISTINCT actor_login) AS stars
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
    AND LENGTH(gu.organization) != 0
    AND gu.organization NOT IN ('', '-', 'none', 'no', 'home', 'n/a', 'null', 'unknown')
GROUP BY organization_name
ORDER BY stars DESC
LIMIT {{ n }}
