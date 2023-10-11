WITH opened_prs_list AS (
    SELECT
        repo_id,
        number,
        actor_login AS opned_by,
        created_at AS opened_at
    FROM
        github_events ge
    WHERE
        ge.repo_id = 41986369
        AND ge.type = 'PullRequestEvent'
        AND ge.action = 'opened'
        -- PRs were opened in the last 28 days.
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
), opened_prs AS (
    SELECT
        COUNT(DISTINCT number) AS prs
    FROM
        opened_prs_list
), merged_prs AS (
     SELECT
         COUNT(DISTINCT ge.number) AS prs
     FROM github_events ge
     JOIN opened_prs_list opl ON ge.repo_id = opl.repo_id AND ge.number = opl.number
     WHERE
        ge.repo_id = 41986369
        AND ge.type = 'PullRequestEvent'
        AND ge.action = 'closed'
        AND ge.pr_merged = true
        -- PRs were merged in the last 28 days.
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
        -- PRs were merged after they were opened.
        AND ge.created_at > opl.opened_at
), opened_issue_list AS (
    SELECT
        repo_id,
        number,
        created_at AS opened_at
    FROM
        github_events ge
    WHERE
        ge.repo_id = 41986369
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'opened'
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
), opened_issues AS (
    SELECT
        COUNT(DISTINCT oil.number) AS issues
    FROM
        opened_issue_list oil
), closed_issues AS (
    SELECT
        COUNT(DISTINCT ge.number) AS issues
    FROM github_events ge
    JOIN opened_issue_list oil ON ge.repo_id = oil.repo_id AND ge.number = oil.number
    WHERE
        ge.repo_id = 41986369
        AND ge.type = 'IssuesEvent'
        AND ge.action = 'closed'
        -- Issues were closed in the last 28 days.
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
        -- Issues were closed after it was opened.
        AND ge.created_at > oil.opened_at
), reviewed_prs AS (
    SELECT
        COUNT(DISTINCT ge.number) AS prs
    FROM github_events ge
    JOIN opened_prs_list opl ON ge.repo_id = opl.repo_id AND ge.number = opl.number
    WHERE
        ge.repo_id = 41986369
        AND ge.type = 'PullRequestReviewEvent'
        AND ge.action = 'created'
        -- PRs were reviewed in the last 28 days.
        AND ge.created_at > DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY)
        -- PRs were reviewed after it was opened.
        AND ge.created_at > opl.opened_at
        -- PRs were reviewed by someone other than the PR author.
        AND ge.actor_login != opl.opned_by
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
