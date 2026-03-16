SELECT EXISTS (
    SELECT 1
    FROM github_events ge
    JOIN github_repos gr ON ge.repo_id = gr.repo_id
    WHERE
        ge.type = 'PullRequestEvent'
        AND ge.action = 'closed'
        AND ge.pr_merged = 1
        AND ge.creator_user_login = 'Mini256'
        AND gr.owner_login IN ('pingcap', 'tikv', 'chaos-mesh')
) AS is_merged_pr_creator