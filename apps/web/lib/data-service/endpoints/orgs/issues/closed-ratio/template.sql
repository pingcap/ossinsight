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
        sub.repo_id, sub.number, sub.opened_by, sub.opened_at,
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
             ge.actor_login AS opened_by,
             ge.created_at AS opened_at,
             ROW_NUMBER() OVER (PARTITION BY ge.repo_id, ge.number ORDER BY ge.created_at) AS times
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
        sub.closed_by,
        sub.closed_at,
        IF(sub.closed_by = oi.opened_by, 'self-closed', 'others-closed') AS type,
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
            ge.actor_login AS closed_by,
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
    # Only consider closed issues that were opened in the period.
    JOIN opened_issues oi USING (repo_id, number)
    WHERE
        # Only consider the first closed event.
        sub.times = 1
), issues_per_type AS (
    (
        SELECT 'un-closed' AS type, oi.period, COUNT(*) AS issues
        FROM opened_issues oi
        LEFT JOIN closed_issues ci USING (repo_id, number)
        WHERE ci.number IS NULL
        GROUP BY oi.period
    )
    UNION ALL
    (
        SELECT type, ci.period, COUNT(*) AS issues
        FROM closed_issues ci
        GROUP BY type, ci.period
    )
), current_period_issues_per_type AS (
    SELECT * FROM issues_per_type WHERE period = 0
), past_period_issues_per_type AS (
    SELECT * FROM issues_per_type WHERE period = 1
), current_period_issues_total AS (
    SELECT SUM(issues) AS issues_total FROM current_period_issues_per_type
), past_period_issues_total AS (
    SELECT SUM(issues) AS issues_total FROM past_period_issues_per_type
)
SELECT
    cpppt.type,
    cpppt.issues AS current_period_issues,
    ROUND(cpppt.issues / cppt.issues_total, 2) AS current_period_percentage,
    ppppt.issues AS past_period_issues,
    ROUND(ppppt.issues / pppt.issues_total, 2) AS past_period_percentage,
    ROUND((cpppt.issues / cppt.issues_total - ppppt.issues / pppt.issues_total), 2) AS percentage_change
FROM current_period_issues_per_type cpppt
LEFT JOIN past_period_issues_per_type ppppt ON cpppt.type = ppppt.type
LEFT JOIN current_period_issues_total cppt ON 1 = 1
LEFT JOIN past_period_issues_total pppt ON 1 = 1
ORDER BY cpppt.issues DESC;