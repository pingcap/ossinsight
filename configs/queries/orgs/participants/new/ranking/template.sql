WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), old_participants AS (
    SELECT
        mrp.user_id,
        gu.login AS user_login,
        mrp.first_engagement_at
    FROM mv_repo_participants mrp
    JOIN github_users gu ON mrp.user_id = gu.id
    WHERE
        {% case period %}
            {% when 'past_7_days' %} mrp.first_engagement_at < (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} mrp.first_engagement_at < (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} mrp.first_engagement_at < (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} mrp.first_engagement_at < (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
)
SELECT
    actor_login AS login, MIN(created_at) AS first_participated_at
FROM github_events ge
WHERE
    ge.repo_id IN (SELECT repo_id FROM repos)
    -- Events considered as participation (Exclude `WatchEvent`, which means star a repo).
    AND ge.type IN ('IssueCommentEvent',  'DeleteEvent',  'CommitCommentEvent',  'MemberEvent',  'PushEvent',  'PublicEvent',  'ForkEvent',  'ReleaseEvent',  'PullRequestReviewEvent',  'CreateEvent',  'GollumEvent',  'PullRequestEvent',  'IssuesEvent',  'PullRequestReviewCommentEvent')
    AND ge.action IN ('added', 'published', 'reopened', 'closed', 'created', 'opened', '')
    {% case period %}
        {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 12 MONTH)
    {% endcase %}
    AND NOT EXISTS (
        SELECT 1
        FROM old_participants op
        WHERE ge.actor_login = op.user_login
    )
GROUP BY actor_login
ORDER BY first_participated_at DESC
LIMIT {{ n }}