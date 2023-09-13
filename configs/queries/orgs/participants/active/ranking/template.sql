WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
)
SELECT
    actor_login AS login, COUNT(*) AS engagements
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
    {% if excludeBots %}
    -- Exclude bot users.
    AND ge.actor_login NOT LIKE '%bot%'
    {% endif %}
GROUP BY actor_login
ORDER BY engagements DESC
LIMIT {{ n }}