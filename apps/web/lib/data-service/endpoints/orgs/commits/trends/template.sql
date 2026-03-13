WITH RECURSIVE seq(idx, day) AS (
    SELECT
        1 AS idx,
        {% case period %}
            {% when 'past_7_days', 'past_28_days', 'past_90_days' %} DATE_FORMAT(CURRENT_DATE(), '%Y-%m-%d')
            {% when 'past_12_months' %} DATE_FORMAT(CURRENT_DATE(), '%Y-%m')
        {% endcase %} AS day
    UNION ALL
    SELECT
        idx + 1 AS idx,
        {% case period %}
            {% when 'past_7_days', 'past_28_days', 'past_90_days' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL idx DAY), '%Y-%m-%d')
            {% when 'past_12_months' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL idx MONTH), '%Y-%m')
        {% endcase %} AS day
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
        pushes,
        commits
    FROM (
        SELECT
            {% case period %}
                {% when 'past_7_days', 'past_28_days', 'past_90_days' %} DATE_FORMAT(created_at, '%Y-%m-%d')
                {% when 'past_12_months' %} DATE_FORMAT(created_at, '%Y-%m-01')
            {% endcase %} AS day,
            COUNT(*) AS pushes,
            SUM(push_distinct_size) AS commits
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
                {% when 'past_7_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 7 DAY)
                {% when 'past_28_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 28 DAY)
                {% when 'past_90_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 90 DAY)
                {% when 'past_12_months' %} AND created_at > (DATE_FORMAT(NOW(), '%Y-%m-01') - INTERVAL 12 MONTH)
            {% endcase %}
        GROUP BY day
        ORDER BY day
    ) sub
)
SELECT
    s.idx AS idx,
    s.day AS day,
    IFNULL(gbd.pushes, 0) AS pushes,
    IFNULL(gbd.commits, 0) AS commits
FROM seq s
LEFT JOIN group_by_day gbd ON gbd.idx = s.idx
WHERE gbd.period = 0
ORDER BY idx
;