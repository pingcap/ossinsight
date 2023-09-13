WITH org AS (
    SELECT id
    FROM github_users
    -- Note: Calculated only when there is no value for stars_total and participant_total.
    WHERE
        id = {{ownerId}}
        AND (stars_total IS NULL OR participant_total IS NULL)
), repos AS (
    SELECT repo_id
    FROM github_repos gr
    WHERE gr.owner_id = (SELECT id FROM org LIMIT 1)
), repo_total AS (
    SELECT COUNT(*) AS repos FROM repos
), repo_summary AS (
    SELECT
        SUM(stars) AS stars
    FROM github_repos gr
    WHERE gr.owner_id = (SELECT id FROM org LIMIT 1)
), participant_summary AS (
    SELECT
        COUNT(DISTINCT ge.actor_login) AS participants
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        -- Events considered as participation (Exclude `WatchEvent`, which means star a repo).
        AND ge.type IN ('IssueCommentEvent',  'DeleteEvent',  'CommitCommentEvent',  'MemberEvent',  'PushEvent',  'PublicEvent',  'ForkEvent',  'ReleaseEvent',  'PullRequestReviewEvent',  'CreateEvent',  'GollumEvent',  'PullRequestEvent',  'IssuesEvent',  'PullRequestReviewCommentEvent')
        AND ge.action IN ('added', 'published', 'reopened', 'closed', 'created', 'opened', '')
), participant_last_event AS (
    SELECT
        MAX(ge.created_at) AS last_participated_at
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM github_repos WHERE owner_id = {{ownerId}})
        -- Events considered as participation (Exclude `WatchEvent`, which means star a repo).
        AND ge.type IN ('IssueCommentEvent',  'DeleteEvent',  'CommitCommentEvent',  'MemberEvent',  'PushEvent',  'PublicEvent',  'ForkEvent',  'ReleaseEvent',  'PullRequestReviewEvent',  'CreateEvent',  'GollumEvent',  'PullRequestEvent',  'IssuesEvent',  'PullRequestReviewCommentEvent')
        AND ge.action IN ('added', 'published', 'reopened', 'closed', 'created', 'opened', '')
)
SELECT
    GREATEST(gu.public_repos, rt.repos) AS public_repos,
    IFNULL(gu.stars_total, rs.stars) AS stars,
    IFNULL(gu.participant_total, ps.participants) AS participants,
    ple.last_participated_at
FROM github_users gu
LEFT JOIN repo_total rt ON 1 = 1
LEFT JOIN repo_summary rs ON 1 = 1
LEFT JOIN participant_summary ps ON 1 = 1
LEFT JOIN participant_last_event ple ON 1 = 1
WHERE id = {{ownerId}}