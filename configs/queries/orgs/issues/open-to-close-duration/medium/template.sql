WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), issues_with_opened_at AS (
    SELECT
        repo_id,
        number,
        actor_login AS opened_by,
        created_at AS opened_at,
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, created_at, NOW()) DIV 7
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, created_at, NOW()) DIV 28
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, created_at, NOW()) DIV 90
            {% when 'past_12_months' %}  TIMESTAMPDIFF(MONTH, created_at, NOW()) DIV 12
        {% endcase %} AS period
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'opened'
        {% if excludeBots %}
        -- Exclude bot users.
        AND ge.actor_login NOT LIKE '%bot%'
        {% endif %}
        {% case period %}
            {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 14 DAY)
            {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 56 DAY)
            {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 180 DAY)
            {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 24 MONTH)
        {% endcase %}
), issues_with_closed_at AS (
    SELECT
        repo_id,
        number,
        actor_login AS closed_by,
        created_at AS closed_at
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'closed'
        {% if excludeBots %}
        -- Exclude bot users.
        AND ge.actor_login NOT LIKE '%bot%'
        {% endif %}
        {% case period %}
            {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 14 DAY)
            {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 56 DAY)
            {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 180 DAY)
            {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 24 MONTH)
        {% endcase %}
), tdiff AS (
    SELECT
        iwo.repo_id,
        iwo.period,
        TIMESTAMPDIFF(SECOND, iwo.opened_at, iwc.closed_at) / 3600 AS hours,
        PERCENT_RANK() OVER (PARTITION BY iwo.period ORDER BY (iwc.closed_at - iwo.opened_at)) AS percentile
    FROM issues_with_opened_at iwo
    JOIN issues_with_closed_at iwc USING (repo_id, number)
    WHERE
        iwc.closed_at > iwo.opened_at
        -- Exclude self-response.
        AND iwc.closed_by != iwo.opened_by
), current_period_medium AS (
    SELECT
        MAX(hours) AS p50
    FROM tdiff
    WHERE
        percentile <= 0.5
        AND period = 0
), past_period_medium AS (
    SELECT
        MAX(hours) AS p50
    FROM tdiff
    WHERE
        percentile <= 0.5
        AND period = 1
)
SELECT
    ROUND(cpm.p50, 2) AS current_period_medium,
    ROUND(ppm.p50, 2) AS past_period_medium,
    ROUND((cpm.p50 - ppm.p50) / ppm.p50, 2) AS percentage
FROM
    current_period_medium cpm, past_period_medium ppm
;