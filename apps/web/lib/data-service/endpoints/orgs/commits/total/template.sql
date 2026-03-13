WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), pushes_per_period AS (
    SELECT
        -- Divide periods.
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, created_at, NOW()) DIV 7
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, created_at, NOW()) DIV 28
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, created_at, NOW()) DIV 90
            {% when 'past_12_months' %}  TIMESTAMPDIFF(MONTH, created_at, NOW()) DIV 12
        {% endcase %} AS period,
        COUNT(*) AS pushes_total
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND type = 'PushEvent'
        AND action = ''
        {% if excludeBots %}
        -- Exclude bot users.
        AND ge.actor_login NOT LIKE '%bot%'
        {% endif %}
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (NOW() - INTERVAL 14 DAY)
            {% when 'past_28_days' %} AND created_at > (NOW() - INTERVAL 56 DAY)
            {% when 'past_90_days' %} AND created_at > (NOW() - INTERVAL 180 DAY)
            {% when 'past_12_months' %} AND created_at > (NOW() - INTERVAL 24 MONTH)
        {% endcase %}
    GROUP BY period
), current_period_pushes AS (
    SELECT pushes_total FROM pushes_per_period WHERE period = 0
), past_period_pushes AS (
    SELECT pushes_total FROM pushes_per_period WHERE period = 1
)
SELECT
    cpp.pushes_total AS current_period_total,
    ppp.pushes_total AS past_period_total,
    ROUND((cpp.pushes_total - ppp.pushes_total) / ppp.pushes_total, 2) AS growth_percentage
FROM
    current_period_pushes cpp,
    past_period_pushes ppp
;