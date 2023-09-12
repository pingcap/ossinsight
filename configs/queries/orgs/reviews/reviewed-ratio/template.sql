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
), reviewed_prs AS (
    SELECT
        sub.repo_id,
        sub.number,
        sub.reviewer_login,
        sub.reviewed_at,
        {% case period %}
            {% when 'past_7_days' %} TIMESTAMPDIFF(DAY, reviewed_at, NOW()) DIV 7
            {% when 'past_28_days' %} TIMESTAMPDIFF(DAY, reviewed_at, NOW()) DIV 28
            {% when 'past_90_days' %} TIMESTAMPDIFF(DAY, reviewed_at, NOW()) DIV 90
            {% when 'past_12_months' %}  TIMESTAMPDIFF(MONTH, reviewed_at, NOW()) DIV 12
        {% endcase %} AS period
    FROM (
        SELECT
            ge.repo_id,
            ge.number,
            ge.actor_login AS reviewer_login,
            ge.created_at AS reviewed_at,
            ROW_NUMBER() OVER (PARTITION BY ge.repo_id, ge.number ORDER BY ge.created_at) AS times
        FROM github_events ge
        WHERE
            ge.repo_id IN (SELECT repo_id FROM repos)
            AND ge.type = 'PullRequestReviewEvent'
            AND ge.action = 'created'
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
    ) sub
    # Only consider merged PRs that were opened in the last 28 days.
    JOIN opened_prs op USING (repo_id, number)
    WHERE
        # Only consider the first merged event.
        sub.times = 1
), opened_prs_per_period AS (
    SELECT op.period, COUNT(*) AS opened_prs
    FROM opened_prs op
    GROUP BY op.period
), reviewed_prs_per_period AS (
    SELECT rp.period, COUNT(*) AS reviewed_prs
    FROM reviewed_prs rp
    GROUP BY rp.period
), current_period_opened_prs AS (
    SELECT * FROM opened_prs_per_period WHERE period = 0
), past_period_opened_prs AS (
    SELECT * FROM opened_prs_per_period WHERE period = 1
), current_period_reviewed_prs AS (
    SELECT * FROM reviewed_prs_per_period WHERE period = 0
), past_period_reviewed_prs AS (
    SELECT * FROM reviewed_prs_per_period WHERE period = 1
)
SELECT
    cpppt.opened_prs AS current_period_opened_prs,
    cprpt.reviewed_prs AS current_period_reviewed_prs,
    ROUND(cprpt.reviewed_prs / cpppt.opened_prs, 2) AS current_period_reviewed_ratio,
    ppppt.opened_prs AS past_period_opened_prs,
    pprpt.reviewed_prs AS past_period_reviewed_prs,
    ROUND(pprpt.reviewed_prs / ppppt.opened_prs, 2) AS past_period_reviewed_ratio,
    ROUND((cprpt.reviewed_prs / cpppt.opened_prs) - (pprpt.reviewed_prs / ppppt.opened_prs), 2) AS reviewed_ratio_change
FROM current_period_opened_prs cpppt
LEFT JOIN current_period_reviewed_prs cprpt ON 1 = 1
LEFT JOIN past_period_opened_prs ppppt ON 1 = 1
LEFT JOIN past_period_reviewed_prs pprpt ON 1 = 1
;