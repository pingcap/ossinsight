WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), repos_per_period AS (
    SELECT
        -- Divide periods.
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, mrde.day, NOW()) DIV 7
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, mrde.day, NOW()) DIV 28
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, mrde.day, NOW()) DIV 90
            {% when 'past_12_months' %}  TIMESTAMPDIFF(MONTH, mrde.day, NOW()) DIV 12
        {% endcase %} AS period,
        COUNT(DISTINCT mrde.repo_id) AS repos_total
    FROM mv_repo_daily_engagements mrde
    WHERE
        mrde.repo_id IN (SELECT repo_id FROM repos)
        {% case period %}
            {% when 'past_7_days' %} AND mrde.day > (NOW() - INTERVAL 14 DAY)
            {% when 'past_28_days' %} AND mrde.day > (NOW() - INTERVAL 56 DAY)
            {% when 'past_90_days' %} AND mrde.day > (NOW() - INTERVAL 180 DAY)
            {% when 'past_12_months' %} AND mrde.day > (NOW() - INTERVAL 24 MONTH)
        {% endcase %}
    GROUP BY period
), current_period_repos AS (
    SELECT repos_total FROM repos_per_period WHERE period = 0
), past_period_repos AS (
    SELECT repos_total FROM repos_per_period WHERE period = 1
)
SELECT
    cpr.repos_total AS current_period_total,
    ppr.repos_total AS past_period_total,
    (cpr.repos_total - ppr.repos_total) / ppr.repos_total AS growth_percentage
FROM
    current_period_repos cpr,
    past_period_repos ppr
;