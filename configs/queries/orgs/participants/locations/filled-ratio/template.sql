WITH repos AS (
    SELECT
        gr.repo_id, gr.repo_name
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), participants_overview AS (
    SELECT
        SUM(CASE WHEN gu.country_code NOT IN ('', 'N/A', 'UND') THEN 1 ELSE 0 END) AS participants_with_country_code,
        COUNT(*) AS participants_total
    FROM github_events ge
    JOIN github_users gu ON ge.actor_login = gu.login
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)

        {% case role %}
        {% when 'pr_creators' %}
            AND ge.type = 'PullRequestEvent' AND ge.action = 'opened'
        {% when 'pr_reviewers' %}
            AND ge.type = 'PullRequestReviewEvent' AND ge.action = 'created'
        {% when 'issue_creators' %}
            AND ge.type = 'IssuesEvent' AND ge.action = 'opened'
        {% when 'commit_authors' %}
            AND ge.type = 'PushEvent' AND ge.action = ''
        {% when 'pr_commenters' %}
            AND ge.type = 'IssueCommentEvent' AND ge.action = 'created'
            AND EXISTS (
                SELECT 1
                FROM github_events ge2
                WHERE
                    ge2.type = 'PullRequestEvent'
                    AND ge2.action = 'opened'
                    AND ge2.created_at < ge.created_at
                    AND ge2.repo_id = ge.repo_id
                    AND ge2.number = ge.number
            )
        {% when 'issue_commenters' %}
            AND ge.type = 'IssueCommentEvent' AND ge.action = 'created'
            AND EXISTS (
                SELECT 1
                FROM github_events ge2
                WHERE
                    ge2.type = 'IssuesEvent'
                    AND ge2.action = 'opened'
                    AND ge2.created_at < ge.created_at
                    AND ge2.repo_id = ge.repo_id
                    AND ge2.number = ge.number
            )
        {% else %}
            -- Events considered as participation (Exclude `WatchEvent`, which means star a repo).
            AND ge.type IN ('IssueCommentEvent',  'DeleteEvent',  'CommitCommentEvent',  'MemberEvent',  'PushEvent',  'PublicEvent',  'ForkEvent',  'ReleaseEvent',  'PullRequestReviewEvent',  'CreateEvent',  'GollumEvent',  'PullRequestEvent',  'IssuesEvent',  'PullRequestReviewCommentEvent')
            AND ge.action IN ('added', 'published', 'reopened', 'closed', 'created', 'opened', '')
        {% endcase %}

        {% case period %}
            {% when 'past_7_days' %} AND ge.created_at > (NOW() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND ge.created_at > (NOW() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND ge.created_at > (NOW() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND ge.created_at > (NOW() - INTERVAL 12 MONTH)
        {% endcase %}
)
SELECT
    ROUND(po.participants_with_country_code / po.participants_total * 100, 2) AS percentage
FROM
    participants_overview po
