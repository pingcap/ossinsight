WITH RECURSIVE seq(idx, current_period_day, past_period_day) AS (
    SELECT
        1 AS idx,
        {% case period %}
            {% when 'past_7_days', 'past_28_days', 'past_90_days' %} DATE_FORMAT(CURRENT_DATE(), '%Y-%m-%d')
            {% when 'past_12_months' %} DATE_FORMAT(CURRENT_DATE(), '%Y-%m')
        {% endcase %} AS current_period_day,
        {% case period %}
            {% when 'past_7_days' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY), '%Y-%m-%d')
            {% when 'past_28_days' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '%Y-%m-%d')
            {% when 'past_90_days' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY), '%Y-%m-%d')
            {% when 'past_12_months' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH), '%Y-%m')
        {% endcase %} AS past_period_day
    UNION ALL
    SELECT
        idx + 1 AS idx,
        {% case period %}
            {% when 'past_7_days', 'past_28_days', 'past_90_days' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL idx DAY), '%Y-%m-%d')
            {% when 'past_12_months' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL idx MONTH), '%Y-%m')
        {% endcase %} AS current_period_day,
        {% case period %}
            {% when 'past_7_days' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL idx + 7 DAY), '%Y-%m-%d')
            {% when 'past_28_days' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL idx + 28 DAY), '%Y-%m-%d')
            {% when 'past_90_days' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL idx + 90 DAY), '%Y-%m-%d')
            {% when 'past_12_months' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL idx + 12 MONTH), '%Y-%m')
        {% endcase %} AS past_period_day
    FROM seq
    WHERE
        1 = 1
        {% case period %}
            {% when 'past_7_days' %} AND idx < 7
            {% when 'past_28_days' %} AND idx < 28
            {% when 'past_90_days' %} AND idx < 90
            {% when 'past_12_months' %} AND idx < 12
        {% endcase %}
), repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), group_by_day AS (
    SELECT
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, day, CURRENT_DATE()) % 7 + 1
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, day, CURRENT_DATE()) % 28 + 1
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, day, CURRENT_DATE()) % 90 + 1
            {% when 'past_12_months' %} TIMESTAMPDIFF(MONTH, day, CURRENT_DATE()) % 12 + 1
        {% endcase %} AS idx,
        -- Divide periods.
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, day, CURRENT_DATE()) DIV 7
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, day, CURRENT_DATE()) DIV 28
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, day, CURRENT_DATE()) DIV 90
            {% when 'past_12_months' %} TIMESTAMPDIFF(MONTH, day, CURRENT_DATE()) DIV 12
        {% endcase %} AS period,
        day,
        issues
    FROM (
        SELECT
            {% case period %}
                {% when 'past_7_days', 'past_28_days', 'past_90_days' %} DATE_FORMAT(created_at, '%Y-%m-%d')
                {% when 'past_12_months' %} DATE_FORMAT(created_at, '%Y-%m-01')
            {% endcase %} AS day,
            COUNT(*) AS issues
        FROM github_events ge
        WHERE
            repo_id IN (SELECT repo_id FROM repos)
            AND type = 'IssuesEvent'
            AND action = 'opened'
            {% if excludeBots %}
            -- Exclude bot users.
            AND ge.actor_login NOT LIKE '%bot%'
            {% endif %}
            {% case period %}
                {% when 'past_7_days' %} AND ge.created_at > (CURRENT_DATE() - INTERVAL 14 DAY)
                {% when 'past_28_days' %} AND ge.created_at > (CURRENT_DATE() - INTERVAL 56 DAY)
                {% when 'past_90_days' %} AND ge.created_at > (CURRENT_DATE() - INTERVAL 180 DAY)
                {% when 'past_12_months' %} AND ge.created_at > (DATE_FORMAT(NOW(), '%Y-%m-01') - INTERVAL 24 MONTH)
            {% endcase %}
        GROUP BY day
        ORDER BY day
    ) sub
), current_period AS (
    SELECT idx, day, issues
    FROM group_by_day
    WHERE period = 0
), past_period AS (
    SELECT idx, day, issues
    FROM group_by_day
    WHERE period = 1
)
SELECT
    s.idx AS idx,
    s.current_period_day AS current_period_day,
    IFNULL(cp.issues, 0) AS current_period_day_total,
    s.past_period_day AS past_period_day,
    IFNULL(pp.issues, 0) AS past_period_day_total
FROM seq s
LEFT JOIN current_period cp ON s.idx = cp.idx
LEFT JOIN past_period pp ON s.idx = pp.idx
ORDER BY idx
;