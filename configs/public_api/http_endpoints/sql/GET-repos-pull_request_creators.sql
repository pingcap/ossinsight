USE gharchive_dev;
SELECT
    gu.id AS id,
    gu.login AS login,
    gu.name AS name,
    prc.prs,
    prc.first_pr_opened_at,
    prc.first_pr_merged_at
FROM
    mv_repo_pull_request_creators AS prc
    JOIN github_users gu on prc.user_id = gu.id
WHERE
    repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
    AND IF(${exclude_bots} = true, gu.is_bot = 0, TRUE)
ORDER BY
    CAST((CASE
        WHEN ${sort} = 'prs' THEN prs 
        WHEN ${sort} = 'prs-desc' THEN -prs
        WHEN ${sort} = 'first_pr_opened_at' THEN first_pr_opened_at
        WHEN ${sort} = 'first_pr_opened_at-desc' THEN -first_pr_opened_at
        WHEN ${sort} = 'first_pr_merged_at' THEN first_pr_merged_at
        WHEN ${sort} = 'first_pr_merged_at-desc' THEN -first_pr_merged_at
        ELSE login
    END) AS SIGNED)