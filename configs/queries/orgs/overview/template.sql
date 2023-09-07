WITH org AS (
    SELECT id
    FROM github_users
    -- Note: Calculated only when there is no value for stars_total and participant_total.
    WHERE id = {{ownerId}} AND (stars_total IS NULL OR participant_total IS NULL)
), repos AS (
    SELECT repo_id
    FROM github_repos gr
    WHERE gr.owner_id = (SELECT id FROM org LIMIT 1)
), stars_total AS (
    SELECT SUM(stars) AS stars
    FROM github_repos gr
    WHERE gr.owner_id = (SELECT id FROM org LIMIT 1)
), participant_total AS (
    SELECT COUNT(DISTINCT ge.actor_login) AS participants
    FROM github_events ge
    WHERE
        ge.repo_id IN (SELECT repo_id FROM repos)
        AND ge.type IN ('PullRequestEvent', 'PullRequestReviewEvent', 'IssuesEvent', 'IssueCommentEvent', 'PushEvent')
        AND ge.action IN ('opened', 'created', '')
)
SELECT
    IFNULL(stars_total, stars) AS stars,
    IFNULL(participant_total, participants) AS participants
FROM
    github_users gu, stars_total, participant_total
WHERE
    id = {{ownerId}}