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
        actor_login, MIN(created_at) AS first_participated_at
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
        {% if excludeBots %}
        -- Exclude bot users.
        AND ge.actor_login NOT LIKE '%bot%'
        {% endif %}
    GROUP BY actor_login
)
SELECT
    actor_login AS login, MIN(created_at) AS first_participated_at
FROM github_events ge
WHERE
    ge.repo_id IN (SELECT repo_id FROM repos)
    AND ge.type IN ('PullRequestEvent', 'PullRequestReviewEvent', 'IssuesEvent', 'IssueCommentEvent', 'PushEvent')
    AND ge.action IN ('opened', 'created', '')
    {% case period %}
        {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 7 DAY)
        {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 28 DAY)
        {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 90 DAY)
        {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 12 MONTH)
    {% endcase %}
    AND NOT EXISTS (
        SELECT 1
        FROM old_participants op
        WHERE ge.actor_login = op.actor_login
    )
GROUP BY actor_login
ORDER BY first_participated_at DESC
LIMIT {{ n }}