WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), stars_per_period AS (
    SELECT
        -- Divide periods.
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, created_at, NOW()) DIV 7
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, created_at, NOW()) DIV 28
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, created_at, NOW()) DIV 90
            {% when 'past_12_months' %}  TIMESTAMPDIFF(MONTH, created_at, NOW()) DIV 12
        {% endcase %} AS period,
        COUNT(*) AS stars_total
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND type = 'WatchEvent'
        AND action = 'started'
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
), current_period_stars AS (
    SELECT stars_total FROM stars_per_period WHERE period = 0
), past_period_stars AS (
    SELECT stars_total FROM stars_per_period WHERE period = 1
)
SELECT
    cps.stars_total AS current_period_total,
    pps.stars_total AS past_period_total,
    (cps.stars_total - pps.stars_total) / pps.stars_total AS growth_percentage
FROM
    current_period_stars cps,
    past_period_stars pps
;