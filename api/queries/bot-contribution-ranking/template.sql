SELECT 
    actor_id, ANY_VALUE(actor_login) AS actor_login, COUNT(*) AS contributions
FROM github_events ge
WHERE
    type IN ('PullRequestEvent', 'IssuesEvent', 'PullRequestReviewEvent', 'PushEvent')
    AND actor_login REGEXP '^(bot-.+|.+bot|.+\\[bot\\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+)$'
    AND (
        (type = 'PullRequestEvent' AND action = 'opened') OR
        (type = 'IssuesEvent' AND action = 'opened') OR  
        (type = 'PullRequestReviewEvent' AND action = 'created') OR
        (type = 'PushEvent')
    )
GROUP BY actor_id
ORDER BY contributions DESC
LIMIT 50