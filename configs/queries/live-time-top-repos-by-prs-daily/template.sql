WITH repos_with_prs_24h AS (
    SELECT
        /*+ READ_FROM_STORAGE(tiflash[ge]) */
        ge.repo_id,
        COUNT(DISTINCT IF(action = 'opened', ge.pr_or_issue_id, NULL))                          AS opened_prs,
        COUNT(DISTINCT IF(action = 'closed' AND ge.pr_merged = false, ge.pr_or_issue_id, NULL)) AS closed_prs,
        COUNT(DISTINCT IF(action = 'closed' AND ge.pr_merged = true, ge.pr_or_issue_id, NULL))  AS merged_prs,
        COUNT(*)                                                                                AS total_pr_events,
        COUNT(DISTINCT actor_id)                                                                AS developers
    FROM
        github_events ge
    WHERE
        ge.type = 'PullRequestEvent'
        AND (ge.action = 'opened' OR ge.action = 'closed')
        AND ge.additions > 10
        AND ge.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
        AND ge.repo_name NOT IN(
            'NixOS/nixpkgs',
            'firstcontributions/first-contributions',
            'Homebrew/homebrew-cask',
            'microsoft/winget-pkgs',
            'microsoft/vcpkg'
        )
        AND ge.actor_login NOT IN(
            'robodoo',
            'r-ryantm',
            'scala-steward'
        )
        AND LOWER(ge.actor_login) NOT REGEXP '^(bot-.+|.+bot|.+\\[bot\\]|.*-bot-.*|robot-.+|.+-ci-.+|.+-ci|.+-testing|.*clabot.*|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.*teamcity.*|jenkins-.+|.+-jira-.+|witness.+|.+witness|signcla.+|.+signcla|.+-cicd-.+|.*autotester.*)$'
    GROUP BY
        ge.repo_id
    HAVING developers > 5
    ORDER BY total_pr_events DESC
    LIMIT 100
)
SELECT
    gr.repo_id, gr.repo_name,
    developers, total_pr_events,
    opened_prs, closed_prs, merged_prs
FROM repos_with_prs_24h r
JOIN github_repos gr ON r.repo_id = gr.repo_id
WHERE gr.stars > 100
ORDER BY total_pr_events DESC
LIMIT 5;
