WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), opened_issues AS (
    SELECT
        sub.repo_id, sub.number, sub.opened_actor_login, sub.opened_at,
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, opened_at, NOW()) DIV 7
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, opened_at, NOW()) DIV 28
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, opened_at, NOW()) DIV 90
            {% when 'past_12_months' %}  TIMESTAMPDIFF(MONTH, opened_at, NOW()) DIV 12
        {% endcase %} AS period
    FROM (
         SELECT
             ge.repo_id,
             ge.number,
             ge.actor_login AS opened_actor_login,
             ge.created_at AS opened_at,
             ROW_NUMBER() OVER (PARTITION BY ge.repo_id, ge.number ORDER BY ge.created_at) AS times
         FROM github_events ge
         WHERE
            ge.repo_id IN (SELECT repo_id FROM repos)
            AND ge.type = 'IssuesEvent'
            AND ge.action = 'opened'
            {% case period %}
                {% when 'past_7_days' %} AND created_at > (NOW() - INTERVAL 14 DAY)
                {% when 'past_28_days' %} AND created_at > (NOW() - INTERVAL 56 DAY)
                {% when 'past_90_days' %} AND created_at > (NOW() - INTERVAL 180 DAY)
                {% when 'past_12_months' %} AND created_at > (NOW() - INTERVAL 24 MONTH)
            {% endcase %}
    ) sub
    WHERE
        # Only consider the first opened event.
        sub.times = 1
), closed_issues AS (
    SELECT
        sub.repo_id,
        sub.number,
        sub.closer_login,
        sub.closed_at,
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, closed_at, NOW()) DIV 7
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, closed_at, NOW()) DIV 28
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, closed_at, NOW()) DIV 90
            {% when 'past_12_months' %}  TIMESTAMPDIFF(MONTH, closed_at, NOW()) DIV 12
        {% endcase %} AS period
    FROM (
        SELECT
            ge.repo_id,
            ge.number,
            ge.actor_login AS closer_login,
            ge.created_at AS closed_at,
            ROW_NUMBER() OVER (PARTITION BY ge.repo_id, ge.number ORDER BY ge.created_at) AS times
        FROM github_events ge
        WHERE
            ge.repo_id IN (SELECT repo_id FROM repos)
            AND ge.type = 'IssuesEvent'
            AND ge.action = 'closed'
            {% case period %}
                {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 14 DAY)
                {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 56 DAY)
                {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 180 DAY)
                {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 24 MONTH)
            {% endcase %}
    ) sub
    # Only consider merged issues that were opened in the last 28 days.
    JOIN opened_issues op USING (repo_id, number)
    WHERE
        # Only consider the first merged event.
        sub.times = 1
), opened_issues_per_period AS (
    SELECT op.period, COUNT(*) AS opened_issues
    FROM opened_issues op
    GROUP BY op.period
), closed_issues_per_period AS (
    SELECT rp.period, COUNT(*) AS closed_issues
    FROM closed_issues rp
    GROUP BY rp.period
), current_period_opened_issues AS (
    SELECT * FROM opened_issues_per_period WHERE period = 0
), past_period_opened_issues AS (
    SELECT * FROM opened_issues_per_period WHERE period = 1
), current_period_closed_issues AS (
    SELECT * FROM closed_issues_per_period WHERE period = 0
), past_period_closed_issues AS (
    SELECT * FROM closed_issues_per_period WHERE period = 1
)
SELECT
    cpoi.opened_issues AS current_period_opened_issues,
    cpci.closed_issues AS current_period_closed_issues,
    ROUND(cpci.closed_issues / cpoi.opened_issues, 2) AS current_period_closed_ratio,
    ppoi.opened_issues AS past_period_opened_issues,
    ppci.closed_issues AS past_period_closed_issues,
    ROUND(ppci.closed_issues / ppoi.opened_issues, 2) AS past_period_closed_ratio,
    ROUND((cpci.closed_issues / cpoi.opened_issues) - (ppci.closed_issues / ppoi.opened_issues), 2) AS closed_ratio_change
FROM current_period_opened_issues cpoi
LEFT JOIN current_period_closed_issues cpci ON 1 = 1
LEFT JOIN past_period_opened_issues ppoi ON 1 = 1
LEFT JOIN past_period_closed_issues ppci ON 1 = 1
;