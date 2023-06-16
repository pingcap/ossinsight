WITH repos_with_prs_24h AS (
    SELECT
        /*+ read_from_storage(tiflash[ge, gr, gu]) */
        ge.repo_id,
        COUNT(DISTINCT CASE WHEN action = 'opened' THEN ge.pr_or_issue_id ELSE NULL END) AS opened_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND ge.pr_merged = false THEN ge.pr_or_issue_id ELSE NULL END) AS closed_prs,
        COUNT(DISTINCT CASE WHEN action = 'closed' AND ge.pr_merged = true THEN ge.pr_or_issue_id ELSE NULL END) AS merged_prs,
        COUNT(DISTINCT actor_id) AS developers
    FROM
        github_events ge
        JOIN github_repos gr ON ge.repo_id = gr.repo_id
        JOIN github_users gu ON ge.actor_id = gu.id
    WHERE
        ge.type = 'PullRequestEvent'
        AND (ge.action = 'opened' OR ge.action = 'closed')
        AND ge.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
        AND ge.actor_login NOT REGEXP '^(bot-.+|.+bot|.+\\[bot\\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+|witness.+|.+witness|signcla.+|.+signcla|.+-cicd-.+|.+autotester.+)$'
        AND gr.stars > 5
        AND gu.is_bot = 0
    GROUP BY
        ge.repo_id
    HAVING developers > 5
), top_5_repos AS (
    SELECT
        repo_id , developers, (opened_prs + closed_prs + merged_prs) as total_pr_events,
        opened_prs, closed_prs, merged_prs
    FROM repos_with_prs_24h rwpr
    ORDER BY total_pr_events DESC
    LIMIT 5
)
SELECT gr.repo_id, gr.repo_name, tr.developers, tr.total_pr_events, tr.opened_prs, tr.closed_prs, tr.merged_prs
FROM top_5_repos tr
JOIN github_repos gr ON tr.repo_id = gr.repo_id
ORDER BY total_pr_events DESC