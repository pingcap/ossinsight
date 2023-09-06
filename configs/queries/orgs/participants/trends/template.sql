WITH RECURSIVE seq(idx, day) AS (
    SELECT
        1 AS idx,
        {% case period %}
            {% when 'past_7_days', 'past_28_days', 'past_90_days' %} CURRENT_DATE()
            {% when 'past_12_months' %} DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        {% endcase %} AS day
    UNION ALL
    SELECT
        idx + 1 AS idx,
        {% case period %}
            {% when 'past_7_days', 'past_28_days', 'past_90_days' %} DATE_SUB(CURRENT_DATE(), INTERVAL idx day)
            {% when 'past_12_months' %} DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL idx MONTH), '%Y-%m-01')
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
), old_participants AS (
    SELECT
        actor_login, MIN(created_at) AS first_participant_at
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type IN ('PullRequestEvent', 'PullRequestReviewEvent', 'IssuesEvent', 'IssueCommentEvent', 'PushEvent')
        AND ge.action IN ('opened', 'created', '')
        {% case period %}
            {% when 'past_7_days' %} AND ge.created_at < (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND ge.created_at < (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND ge.created_at < (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND ge.created_at < (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
    GROUP BY actor_login
), active_participants_per_day AS (
    SELECT
        {% case period %}
            {% when 'past_7_days', 'past_28_days', 'past_90_days' %} DATE_FORMAT(created_at, '%Y-%m-%d')
            {% when 'past_12_months' %} DATE_FORMAT(created_at, '%Y-%m-01')
        {% endcase %} AS day,
        COUNT(DISTINCT actor_login) AS active_participants
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND ge.type IN ('PullRequestEvent', 'PullRequestReviewEvent', 'IssuesEvent', 'IssueCommentEvent', 'PushEvent')
        AND ge.action IN ('opened', 'created', '')
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND created_at > (CURRENT_DATE() - INTERVAL 12 MONTH)
        {% endcase %}
    GROUP BY day
    ORDER BY day
), new_participants_per_day AS (
    SELECT
        {% case period %}
            {% when 'past_7_days', 'past_28_days', 'past_90_days' %} DATE_FORMAT(first_engagement_at, '%Y-%m-%d')
            {% when 'past_12_months' %} DATE_FORMAT(first_engagement_at, '%Y-%m-01')
        {% endcase %} AS day,
        COUNT(DISTINCT actor_login) AS new_participants
    FROM (
        SELECT
            actor_login,
            MIN(created_at) AS first_engagement_at
        FROM github_events ge
        WHERE
            repo_id IN (SELECT repo_id FROM repos)
            AND ge.type IN ('PullRequestEvent', 'PullRequestReviewEvent', 'IssuesEvent', 'IssueCommentEvent', 'PushEvent')
            AND ge.action IN ('opened', 'created', '')
            {% case period %}
                {% when 'past_7_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 7 DAY)
                {% when 'past_28_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 28 DAY)
                {% when 'past_90_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 90 DAY)
                {% when 'past_12_months' %} AND created_at > (CURRENT_DATE() - INTERVAL 12 MONTH)
            {% endcase %}
            AND NOT EXISTS (
                SELECT 1
                FROM old_participants op
                WHERE op.actor_login = ge.actor_login
            )
        GROUP BY actor_login
    ) AS participant_with_first_engagement
    GROUP BY day
)
SELECT
    s.day,
    appd.active_participants,
    nppd.new_participants
FROM seq s
LEFT JOIN active_participants_per_day appd ON s.day = appd.day
LEFT JOIN new_participants_per_day nppd ON s.day = nppd.day
ORDER BY s.day
;