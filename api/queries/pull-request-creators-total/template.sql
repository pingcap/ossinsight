SELECT
    IFNULL(COUNT(DISTINCT actor_login), 0) AS pr_creators
FROM github_events
WHERE
    repo_id = 41986369
    AND type = 'PullRequestEvent';
