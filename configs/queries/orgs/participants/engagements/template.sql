WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), participants AS (
    SELECT
        actor_login AS participant_login,
        COUNT(DISTINCT repo_id) AS repos,
        COUNT(*) AS engagements
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
    GROUP BY actor_login
)
SELECT
    repos,
    engagements,
    COUNT(*) AS participants
FROM participants
GROUP BY repos, engagements