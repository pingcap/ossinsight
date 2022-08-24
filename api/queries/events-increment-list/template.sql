SELECT id, type, action, actor_id, actor_login, repo_id, repo_name, number, pr_merged, created_at
FROM github_events 
WHERE
    created_at BETWEEN (
        UTC_TIMESTAMP - INTERVAL 6 MINUTE - INTERVAL UNIX_TIMESTAMP(UTC_TIMESTAMP - INTERVAL 6 MINUTE) % 5 SECOND
    ) AND (
        UTC_TIMESTAMP - INTERVAL 5 MINUTE - INTERVAL UNIX_TIMESTAMP(UTC_TIMESTAMP - INTERVAL 5 MINUTE) % 5 SECOND
    )
    AND actor_login NOT LIKE '%[bot]'
    AND actor_login NOT LIKE '%-bot'
    AND type IN (
        'WatchEvent', 'ForkEvent', 'IssuesEvent', 'PullRequestEvent', 'PushEvent', 'CreateEvent', 'ReleaseEvent', 
        'PullRequestReviewCommentEvent', 'PullRequestReviewEvent', 'IssueCommentEvent'
    )
ORDER BY created_at DESC
LIMIT 50;
