WITH
    # Fetch all WatchEvents group by repo_id
    WatchEvents AS (
        SELECT
            /*+ read_from_storage(tiflash[github_events]) */
            repo_id,
            COUNT(id) count
        FROM github_events github_events
        WHERE type = 'WatchEvent'
          AND (created_at >= '2022-04-04 02:59:59' AND created_at < '2022-04-11 02:59:59')
          AND actor_login NOT LIKE '%bot%'
          AND actor_login NOT IN (SELECT login FROM blacklist_users)
          AND repo_name NOT IN (SELECT name FROM blacklist_repos)
        GROUP BY repo_id
        HAVING count > 0
    ),
    # Fetch all PullRequestEvents group by repo_id
    PullRequestEvents AS (
        SELECT
            /*+ read_from_storage(tiflash[github_events]) */
            repo_id,
            COUNT(id) count
        FROM github_events github_events
        WHERE type = 'PullRequestEvent'
          AND (created_at >= '2022-04-04 02:59:59' AND created_at < '2022-04-11 02:59:59')
          AND actor_login NOT LIKE '%bot%'
          AND actor_login NOT IN (SELECT login FROM blacklist_users)
          AND repo_name NOT IN (SELECT name FROM blacklist_repos)
        GROUP BY repo_id
        HAVING count > 0
    ),
    # Fetch all IssuesEvents group by repo_id
    IssuesEvents AS (
        SELECT
            /*+ read_from_storage(tiflash[github_events]) */
            repo_id,
            COUNT(id) count
        FROM github_events github_events
        WHERE type = 'IssuesEvent'
          AND (created_at >= '2022-04-04 02:59:59' AND created_at < '2022-04-11 02:59:59')
          AND actor_login NOT LIKE '%bot%'
          AND actor_login NOT IN (SELECT login FROM blacklist_users)
          AND repo_name NOT IN (SELECT name FROM blacklist_repos)
        GROUP BY repo_id
        HAVING count > 0
    ),
    # Fetch all IssueCommentEvents group by repo_id
    IssueCommentEvents AS (
        SELECT
            /*+ read_from_storage(tiflash[github_events]) */
            repo_id,
            COUNT(id) count
        FROM github_events github_events
        WHERE type = 'IssueCommentEvent'
          AND (created_at >= '2022-04-04 02:59:59' AND created_at < '2022-04-11 02:59:59')
          AND actor_login NOT LIKE '%bot%'
          AND actor_login NOT IN (SELECT login FROM blacklist_users)
          AND repo_name NOT IN (SELECT name FROM blacklist_repos)
        GROUP BY repo_id
        HAVING count > 0
    ),
    # Fetch all PullRequestReviewEvents group by repo_id
    PullRequestReviewEvents AS (
        SELECT
            /*+ read_from_storage(tiflash[github_events]) */
            repo_id,
            COUNT(id) count
        FROM github_events github_events
        WHERE type = 'PullRequestReviewEvent'
          AND (created_at >= '2022-04-04 02:59:59' AND created_at < '2022-04-11 02:59:59')
          AND actor_login NOT LIKE '%bot%'
          AND actor_login NOT IN (SELECT login FROM blacklist_users)
          AND repo_name NOT IN (SELECT name FROM blacklist_repos)
        GROUP BY repo_id
        HAVING count > 0
    ),
    # Fetch all PullRequestReviewCommentEvents group by repo_id
    PullRequestReviewCommentEvents AS (
        SELECT
            /*+ read_from_storage(tiflash[github_events]) */
            repo_id,
            COUNT(id) count
        FROM github_events github_events
        WHERE type = 'PullRequestReviewCommentEvent'
          AND (created_at >= '2022-04-04 02:59:59' AND created_at < '2022-04-11 02:59:59')
          AND actor_login NOT LIKE '%bot%'
          AND actor_login NOT IN (SELECT login FROM blacklist_users)
          AND repo_name NOT IN (SELECT name FROM blacklist_repos)
        GROUP BY repo_id
        HAVING count > 0
    ),
    # Fetch all CommitCommentEvents group by repo_id
    CommitCommentEvents AS (
        SELECT
            /*+ read_from_storage(tiflash[github_events]) */
            repo_id,
            COUNT(id) count
        FROM github_events github_events
        WHERE type = 'CommitCommentEvent'
          AND (created_at >= '2022-04-04 02:59:59' AND created_at < '2022-04-11 02:59:59')
          AND actor_login NOT LIKE '%bot%'
          AND actor_login NOT IN (SELECT login FROM blacklist_users)
          AND repo_name NOT IN (SELECT name FROM blacklist_repos)
        GROUP BY repo_id
        HAVING count > 0
    )
SELECT
    /*+ read_from_storage(tiflash[gh]) */
    ANY_VALUE(gh.repo_name)                         repo_name,
    count(*)																				history_events,
    IFNULL(WatchEvents.count, 0)                    watch_events,
    IFNULL(PullRequestEvents.count, 0)              pull_request_events,
    IFNULL(IssuesEvents.count, 0)                   issues_events,
    IFNULL(IssueCommentEvents.count, 0)             issue_comment_events,
    IFNULL(PullRequestReviewEvents.count, 0)        pull_request_review_events,
    IFNULL(PullRequestReviewCommentEvents.count, 0) pull_request_review_comment_events,
    IFNULL(CommitCommentEvents.count, 0)            commit_comment_events
FROM github_events gh
    LEFT JOIN WatchEvents ON gh.repo_id = WatchEvents.repo_id
    LEFT JOIN PullRequestEvents ON gh.repo_id = PullRequestEvents.repo_id
    LEFT JOIN IssuesEvents ON gh.repo_id = IssuesEvents.repo_id
    LEFT JOIN IssueCommentEvents ON gh.repo_id = IssueCommentEvents.repo_id
    LEFT JOIN PullRequestReviewEvents ON gh.repo_id = PullRequestReviewEvents.repo_id
    LEFT JOIN PullRequestReviewCommentEvents ON gh.repo_id = PullRequestReviewCommentEvents.repo_id
    LEFT JOIN CommitCommentEvents ON gh.repo_id = CommitCommentEvents.repo_id
WHERE
    (
        WatchEvents.count > 0
        OR PullRequestEvents.count > 0
        OR IssuesEvents.count > 0
        OR IssueCommentEvents.count > 0
        OR PullRequestReviewEvents.count > 0
        OR PullRequestReviewCommentEvents.count > 0
        OR CommitCommentEvents.count > 0
    )
    AND (created_at >= '2022-04-04 02:59:59' AND created_at < '2022-04-11 02:59:59')
    AND actor_login NOT LIKE '%bot%'
    AND actor_login NOT IN (SELECT login FROM blacklist_users)
    AND repo_name NOT IN (SELECT name FROM blacklist_repos)
    AND type IN ('WatchEvent', 'PullRequestEvent', 'IssuesEvent', 'IssueCommentEvent', 'PullRequestReviewCommentEvent', 'CommitCommentEvent')
GROUP BY gh.repo_name
ORDER BY history_events DESC
LIMIT 20
;
