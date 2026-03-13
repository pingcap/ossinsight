WITH repos AS (
    SELECT
        gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), prs_with_opened_at AS (
    SELECT
        repo_id,
        number,
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
        AND ge.type = 'PullRequestEvent'
        AND ge.action = 'opened'
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (NOW() - INTERVAL 14 DAY)
            {% when 'past_28_days' %} AND created_at > (NOW() - INTERVAL 56 DAY)
            {% when 'past_90_days' %} AND created_at > (NOW() - INTERVAL 180 DAY)
            {% when 'past_12_months' %} AND created_at > (NOW() - INTERVAL 24 MONTH)
        {% endcase %}
), prs_with_first_reviewed_at AS (
    SELECT
        repo_id,
        number,
        created_at AS first_reviewed_at
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        -- Events that are considered as first review.
        AND ge.type = 'PullRequestReviewEvent'
        AND ge.action = 'created'
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
), tdiff AS (
    SELECT
        pwo.repo_id,
        pwo.period,
        TIMESTAMPDIFF(SECOND, pwo.opened_at, pwr.first_reviewed_at) / 3600 AS hours,
        PERCENT_RANK() OVER (PARTITION BY pwo.period ORDER BY (pwr.first_reviewed_at - pwo.opened_at)) AS percentile
    FROM prs_with_opened_at pwo
    JOIN prs_with_first_reviewed_at pwr USING (repo_id, number)
    WHERE
        pwr.first_reviewed_at > pwo.opened_at
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
    current_period_medium cpm,
    past_period_medium ppm
;