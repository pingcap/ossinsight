WITH repos AS (
    SELECT
        gr.repo_id, gr.repo_name
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), issues_with_opened_at AS (
    SELECT
        repo_id, number, created_at AS opened_at
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
            {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
), issues_with_closed_at AS (
    SELECT
        repo_id, number, created_at AS closed_at
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
        pwo.repo_id,
        TIMESTAMPDIFF(SECOND, pwo.opened_at, pwc.closed_at) / 3600 AS hours,
        PERCENT_RANK() OVER (PARTITION BY pwo.repo_id ORDER BY (pwc.closed_at - pwo.opened_at)) AS percentile
    FROM issues_with_opened_at pwo
    JOIN issues_with_closed_at pwc USING (repo_id, number)
    WHERE pwc.closed_at > pwo.opened_at
), tdiff_percentiles AS (
    SELECT
        repo_id,
        MAX(CASE WHEN percentile <= 0 THEN hours END) AS p0,
        MAX(CASE WHEN percentile <= 0.25 THEN hours END) AS p25,
        MAX(CASE WHEN percentile <= 0.5 THEN hours END) AS p50,
        MAX(CASE WHEN percentile <= 0.75 THEN hours END) AS p75,
        MAX(CASE WHEN percentile <= 1 THEN hours END) AS p100
    FROM tdiff
    GROUP BY repo_id
)
SELECT
    r.repo_id,
    r.repo_name,
    p0,
    p25,
    p50,
    p75,
    p100
FROM repos r
JOIN tdiff_percentiles tp USING (repo_id)
ORDER BY p50
LIMIT {{n}}
;
