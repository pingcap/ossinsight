WITH developers_with_prs_24h AS (
    SELECT
        /*+ READ_FROM_STORAGE(tiflash[ge]) */
        ge.actor_id,
        COUNT(DISTINCT CASE WHEN action = 'opened' THEN ge.pr_or_issue_id END) AS opened_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND ge.pr_merged = false THEN ge.pr_or_issue_id END) AS closed_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND ge.pr_merged = true THEN ge.pr_or_issue_id END) AS merged_prs,
        COUNT(*) AS total_pr_events
    FROM
        github_events ge
    WHERE
        ge.type = 'PullRequestEvent'
        AND (ge.action = 'opened' OR ge.action = 'closed')
        AND ge.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
        AND ge.actor_login NOT IN (SELECT login FROM blacklist_users)
        AND ge.actor_login NOT REGEXP '^(bot-.+|.+bot|.+\\[bot\\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|.+-sdk|.+-integration|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+|witness.+|.+witness|signcla.+|.+signcla|.+-cicd-.+|.+autotester.+)$'
        AND ge.additions > 10
    GROUP BY
        ge.actor_id
    ORDER BY total_pr_events DESC
)
SELECT
    gu.id AS actor_id,
    gu.login AS actor_login,
    d.total_pr_events,
    d.opened_prs,
    d.closed_prs,
    d.merged_prs
FROM developers_with_prs_24h d
JOIN github_users gu ON gu.id = d.actor_id
WHERE
    gu.followers > 5
ORDER BY total_pr_events DESC
LIMIT 5