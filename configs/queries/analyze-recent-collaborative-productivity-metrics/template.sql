WITH opened_prs AS (
    SELECT
        COUNT(*) AS prs
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestEvent'
        AND action = 'opened'
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
), merged_prs AS (
     SELECT
         COUNT(*) AS prs
     FROM
         github_events ge
     WHERE
        repo_id = 41986369
        AND type = 'PullRequestEvent'
        AND action = 'closed'
        AND pr_merged = true
        -- PR was merged in the last 28 days.
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
        -- PR was created in the last 28 days.
        AND ge.pr_or_issue_created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
), opened_issues AS (
    SELECT
        COUNT(*) AS issues
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'IssuesEvent'
        AND action = 'opened'
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
), closed_issues AS (
    SELECT
        COUNT(*) AS issues
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'IssuesEvent'
        AND action = 'closed'
        -- Issue was closed in the last 28 days.
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
        -- Issue was opened in the last 28 days.
        AND ge.pr_or_issue_created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
), reviewed_prs AS (
    SELECT
        COUNT(DISTINCT number) AS prs
    FROM
        github_events ge
    WHERE
        repo_id = 41986369
        AND type = 'PullRequestReviewEvent'
        AND action = 'created'
        -- PR was reviewed in the last 28 days.
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
        -- PR was created in the last 28 days.
        AND ge.pr_or_issue_created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
)
SELECT
    mp.prs / op.prs * 100 AS pr_merged_ratio,
    rp.prs / op.prs * 100 AS pr_reviewed_ratio,
    ci.issues / oi.issues * 100 AS issue_closed_ratio
FROM
    opened_prs op,
    merged_prs mp,
    reviewed_prs rp,
    opened_issues oi,
    closed_issues ci
