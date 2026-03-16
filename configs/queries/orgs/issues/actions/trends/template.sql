WITH repos AS (
    SELECT
        gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
)
SELECT
    ge.action AS action_type,
    {% case period %}
        {% when 'past_7_days', 'past_28_days', 'past_90_days'  %} DATE(created_at)
        {% when 'past_12_months' %} DATE_FORMAT(created_at, '%Y-%m')
    {% endcase %} AS date,
    COUNT(*) AS issues
FROM github_events ge
WHERE
    ge.repo_id IN (SELECT repo_id FROM repos)
    AND ge.type = 'IssuesEvent'
    AND ge.action IN ('opened', 'closed')
    {% if excludeBots %}
    -- Exclude bot users.
    AND ge.actor_login NOT LIKE '%bot%'
    {% endif %}
    {% case period %}
        {% when 'past_7_days' %} AND created_at > (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %} AND created_at > (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %} AND created_at > (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %} AND created_at > (DATE_FORMAT(NOW(), '%Y-%m-01') - INTERVAL 12 MONTH)
    {% endcase %}
GROUP BY action, date
ORDER BY date, action_type