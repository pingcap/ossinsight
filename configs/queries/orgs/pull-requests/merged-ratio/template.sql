WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), opened_prs AS (
    SELECT
        sub.repo_id,
        sub.number,
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
             ge.created_at AS opened_at,
             ROW_NUMBER() OVER (PARTITION BY ge.repo_id, ge.number ORDER BY ge.created_at) AS times
         FROM github_events ge
         WHERE
            ge.repo_id IN (SELECT repo_id FROM repos)
            AND ge.type = 'PullRequestEvent'
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
), merged_prs AS (
    SELECT
        sub.repo_id,
        sub.number,
        IF(sub.pr_merged = 1, 'merged', 'closed') AS type,
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, merged_at, NOW()) DIV 7
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, merged_at, NOW()) DIV 28
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, merged_at, NOW()) DIV 90
            {% when 'past_12_months' %}  TIMESTAMPDIFF(MONTH, merged_at, NOW()) DIV 12
        {% endcase %} AS period
    FROM (
        SELECT
            ge.repo_id,
            ge.number,
            ge.pr_merged,
            ge.created_at AS merged_at,
            ROW_NUMBER() OVER (PARTITION BY ge.repo_id, ge.number ORDER BY ge.created_at) AS times
        FROM github_events ge
        WHERE
            ge.repo_id IN (SELECT repo_id FROM repos)
            AND ge.type = 'PullRequestEvent'
            AND ge.action = 'closed'
            {% case period %}
                {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 14 DAY)
                {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 56 DAY)
                {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 180 DAY)
                {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 24 MONTH)
            {% endcase %}
    ) sub
    # Only consider merged PRs that were opened in the period.
    JOIN opened_prs op USING (repo_id, number)
    WHERE
        # Only consider the first merged event.
        sub.times = 1
), prs_per_type AS (
    (
        SELECT 'open' AS type, op.period, COUNT(*) AS prs
        FROM opened_prs op
        LEFT JOIN merged_prs mp USING (repo_id, number)
        WHERE mp.number IS NULL
        GROUP BY op.period
    )
    UNION ALL
    (
        SELECT type, mp.period, COUNT(*) AS prs
        FROM merged_prs mp
        GROUP BY type, mp.period
    )
), current_period_prs_per_type AS (
    SELECT * FROM prs_per_type WHERE period = 0
), past_period_prs_per_type AS (
    SELECT * FROM prs_per_type WHERE period = 1
), current_period_prs_total AS (
    SELECT SUM(prs) AS prs_total FROM current_period_prs_per_type
), past_period_prs_total AS (
    SELECT SUM(prs) AS prs_total FROM past_period_prs_per_type
)
SELECT
    cpppt.type,
    cpppt.prs AS current_period_prs,
    ROUND(cpppt.prs / cppt.prs_total, 4) AS current_period_percentage,
    ppppt.prs AS past_period_prs,
    ROUND(ppppt.prs / pppt.prs_total, 4) AS past_period_percentage,
    ROUND((cpppt.prs / cppt.prs_total - ppppt.prs / pppt.prs_total), 4) AS percentage_change
FROM current_period_prs_per_type cpppt
LEFT JOIN past_period_prs_per_type ppppt ON cpppt.type = ppppt.type
LEFT JOIN current_period_prs_total cppt ON 1 = 1
LEFT JOIN past_period_prs_total pppt ON 1 = 1
ORDER BY cpppt.prs DESC;