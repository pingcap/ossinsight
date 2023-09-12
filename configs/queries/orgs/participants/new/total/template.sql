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
), current_period_new_participants AS (
    SELECT
        COUNT(DISTINCT ge.actor_login) AS new_participants
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
), past_period_new_participants AS (
    SELECT
        COUNT(DISTINCT ge.actor_login) AS new_participants
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type IN ('PullRequestEvent', 'PullRequestReviewEvent', 'IssuesEvent', 'IssueCommentEvent', 'PushEvent')
        AND ge.action IN ('opened', 'created', '')
        {% case period %}
            {% when 'past_7_days' %} AND ge.created_at BETWEEN (NOW() - INTERVAL 14 DAY) AND (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND ge.created_at BETWEEN (NOW() - INTERVAL 56 DAY) AND (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND ge.created_at BETWEEN (NOW() - INTERVAL 180 DAY) AND (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND ge.created_at BETWEEN (NOW() - INTERVAL 24 MONTH) AND (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
        AND NOT EXISTS (
            SELECT 1
            FROM old_participants op
            WHERE
                ge.actor_login = op.actor_login
                {% case period %}
                    {% when 'past_7_days' %} AND op.first_participant_at < (NOW() - INTERVAL 14 DAY)
                    {% when 'past_28_days' %} AND op.first_participant_at < (NOW() - INTERVAL 56 DAY)
                    {% when 'past_90_days' %} AND op.first_participant_at < (NOW() - INTERVAL 180 DAY)
                    {% when 'past_12_months' %} AND op.first_participant_at < (NOW() - INTERVAL 24 MONTH)
                {% endcase %}
        )
)
SELECT
    cpnp.new_participants AS current_period_total,
    ppnp.new_participants AS past_period_total,
    (cpnp.new_participants - ppnp.new_participants) / ppnp.new_participants AS growth_percentage
FROM
    current_period_new_participants cpnp,
    past_period_new_participants ppnp
;