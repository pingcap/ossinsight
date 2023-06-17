WITH developers_with_prs_24h AS (
    SELECT
        /*+ READ_FROM_STORAGE(tiflash[ge, gu]) */
        ge.actor_id,
        COUNT(DISTINCT CASE WHEN action = 'opened' THEN ge.pr_or_issue_id END)                                   AS opened_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND ge.pr_merged = false THEN ge.pr_or_issue_id END)          AS closed_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND ge.pr_merged = true THEN ge.pr_or_issue_id END) AS merged_prs
    FROM
        github_events ge
        JOIN github_users gu ON gu.id = ge.actor_id
    WHERE
        ge.type = 'PullRequestEvent'
        AND (ge.action = 'opened' OR ge.action = 'closed')
        AND ge.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
        AND ge.actor_login NOT IN (SELECT bu.login FROM blacklist_users bu)
        AND ge.actor_login NOT REGEXP '^(bot-.+|.+bot|.+\\[bot\\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+|witness.+|.+witness|signcla.+|.+signcla|.+-cicd-.+|.+autotester.+)$'
        AND gu.is_bot = 0
        AND gu.followers > 5
    GROUP BY
        ge.actor_id
), top_5_repos AS (
    SELECT
        actor_id, (opened_prs + closed_prs + merged_prs) as total_pr_events,
        opened_prs, closed_prs, merged_prs
    FROM developers_with_prs_24h
    ORDER BY total_pr_events DESC
    LIMIT 5
)
SELECT
    gu.id AS actor_id,
    gu.login AS actor_login,
    t5r.total_pr_events,
    t5r.opened_prs,
    t5r.closed_prs,
    t5r.merged_prs
FROM top_5_repos t5r
 JOIN github_users gu ON gu.id = t5r.actor_id
ORDER BY total_pr_events DESC