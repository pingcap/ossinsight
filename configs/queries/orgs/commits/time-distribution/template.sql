WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
)
SELECT
    DAYOFWEEK(created_at) - 1 AS dayofweek,
    HOUR(created_at) AS hour,
    COUNT(*) AS pushes
FROM
    github_events ge
WHERE
    repo_id IN (SELECT repo_id FROM repos)
    AND type = 'PushEvent'
    AND action = ''
    {% if excludeBots %}
    -- Exclude bot users.
    AND ge.actor_login NOT LIKE '%bot%'
    {% endif %}
    {% case period %}
        {% when 'past_7_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 14 DAY)
        {% when 'past_28_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 56 DAY)
        {% when 'past_90_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 180 DAY)
        {% when 'past_12_months' %} AND created_at > (CURRENT_DATE() - INTERVAL 24 MONTH)
    {% endcase %}
GROUP BY dayofweek, hour
ORDER BY dayofweek, hour
