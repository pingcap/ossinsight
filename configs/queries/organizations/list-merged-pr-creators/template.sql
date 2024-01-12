SELECT
    ANY_VALUE(ge.creator_user_id) AS github_id,
    ge.creator_user_login AS github_login,
    COUNT(*) AS pr_count
FROM github_events ge
JOIN github_repos gr on ge.repo_id = gr.repo_id
WHERE
    ge.type = 'PullRequestEvent'
    AND ge.action = 'closed'
    AND ge.pr_merged = 1
    AND gr.owner_login IN ('pingcap', 'tikv', 'chaos-mesh')
GROUP BY ge.creator_user_login
ORDER BY pr_count DESC