USE gharchive_dev;
SELECT
    gu.id AS id,
    gu.login AS login,
    gu.name AS name,
    ric.issues,
    ric.first_issue_opened_at
FROM
    mv_repo_issue_creators AS ric
    JOIN github_users gu on ric.user_id = gu.id
WHERE
    repo_id = (SELECT repo_id FROM github_repos WHERE repo_name = CONCAT(${owner}, '/', ${repo}) LIMIT 1)
    AND IF(${exclude_bots} = true, gu.is_bot = 0, TRUE)
ORDER BY
    CAST((CASE
        WHEN ${sort} = 'issues' THEN issues 
        WHEN ${sort} = 'issues-desc' THEN -issues
        WHEN ${sort} = 'first_issue_opened_at' THEN first_issue_opened_at
        WHEN ${sort} = 'first_issue_opened_at-desc' THEN -first_issue_opened_at
        ELSE login
    END) AS SIGNED)