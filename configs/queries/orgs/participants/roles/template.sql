WITH repos AS (
    SELECT gr.repo_id
    FROM github_repos gr
    WHERE
        gr.owner_id = {{ownerId}}
        {% if repoIds.size > 0 %}
        AND gr.repo_id IN ({{ repoIds | join: ',' }})
        {% endif %}
), pr_creators AS (
    SELECT
        COUNT(DISTINCT actor_login) AS pr_creators
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND ge.type ='PullRequestEvent'
        AND ge.action = 'opened'
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
), pr_reviewers AS (
    SELECT
        COUNT(DISTINCT actor_login) AS pr_reviewers
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND ge.type ='PullRequestReviewEvent'
        AND ge.action = 'created'
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND created_at > (CURRENT_DATE() - INTERVAL 12 MONTH)
        {% endcase %}
), pr_commenters AS (
    SELECT
        COUNT(DISTINCT actor_login) AS pr_commenters
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND ge.type ='IssueCommentEvent'
        AND ge.action = 'created'
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
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND created_at > (CURRENT_DATE() - INTERVAL 12 MONTH)
        {% endcase %}
), issue_creators AS (
    SELECT
        COUNT(DISTINCT actor_login) AS issue_creators
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND ge.type ='IssuesEvent'
        AND ge.action = 'opened'
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND created_at > (CURRENT_DATE() - INTERVAL 12 MONTH)
        {% endcase %}
), issue_commenters AS (
    SELECT
        COUNT(DISTINCT actor_login) AS issue_commenters
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND ge.type ='IssueCommentEvent'
        AND ge.action = 'created'
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
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND created_at > (CURRENT_DATE() - INTERVAL 12 MONTH)
        {% endcase %}
), commit_authors AS (
    SELECT
        COUNT(DISTINCT actor_login) AS commit_authors
        FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND ge.type ='PushEvent'
        AND ge.action = ''
        {% case period %}
            {% when 'past_7_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND created_at > (CURRENT_DATE() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND created_at > (CURRENT_DATE() - INTERVAL 12 MONTH)
        {% endcase %}
), participants AS (
    SELECT
        COUNT(DISTINCT user_login) AS participants
    FROM mv_repo_daily_engagements
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        {% case period %}
            {% when 'past_7_days' %} AND day > (CURRENT_DATE() - INTERVAL 7 DAY)
            {% when 'past_28_days' %} AND day > (CURRENT_DATE() - INTERVAL 28 DAY)
            {% when 'past_90_days' %} AND day > (CURRENT_DATE() - INTERVAL 90 DAY)
            {% when 'past_12_months' %} AND day > (CURRENT_DATE() - INTERVAL 12 MONTH)
        {% endcase %}
)
SELECT
    pr_creators,
    pr_reviewers,
    pr_commenters,
    issue_creators,
    issue_commenters,
    commit_authors,
    participants
FROM
    pr_creators,
    pr_reviewers,
    pr_commenters,
    issue_creators,
    issue_commenters,
    commit_authors,
    participants


