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
        COUNT(*) AS engagements,
        MIN(created_at) AS first_engagement
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        -- Events considered as participation (Exclude `WatchEvent`, which means star a repo).
        AND ge.type IN ('IssueCommentEvent',  'DeleteEvent',  'CommitCommentEvent',  'MemberEvent',  'PushEvent',  'PublicEvent',  'ForkEvent',  'ReleaseEvent',  'PullRequestReviewEvent',  'CreateEvent',  'GollumEvent',  'PullRequestEvent',  'IssuesEvent',  'PullRequestReviewCommentEvent')
        AND ge.action IN ('added', 'published', 'reopened', 'closed', 'created', 'opened', '')
        {% if excludeBots %}
        -- Exclude bot users.
        AND ge.actor_login NOT LIKE '%bot%'
        {% endif %}
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
    COUNT(*) AS participants,
    SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT participant_login ORDER BY first_engagement DESC SEPARATOR ','), ',', 5) AS participant_logins
FROM participants
GROUP BY repos, engagements