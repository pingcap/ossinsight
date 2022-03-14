WITH stars AS (
    SELECT /*+ read_from_storage(tiflash[github_events]) */
        db.name AS repo_name,
        COUNT(*) AS count
    FROM github_events
             JOIN db_repos db ON db.id = github_events.repo_id
    WHERE type = 'WatchEvent' and event_year = 2021
    GROUP BY 1
),

     prs as (
         SELECT /*+ read_from_storage(tiflash[github_events]) */
             db.name AS repo_name,
             COUNT(*) AS count
         FROM github_events
                  JOIN db_repos db ON db.id = github_events.repo_id
         WHERE type = 'PullRequestEvent' and event_year = 2021 and action = 'opened'
         GROUP BY 1
     ),

     contributors AS (
         SELECT /*+ read_from_storage(tiflash[github_events]) */
             db.name AS repo_name,
             count(distinct actor_id) AS count
         FROM github_events
                  JOIN db_repos db ON db.id = github_events.repo_id
         WHERE type in (
                        'IssuesEvent',
                        'PullRequestEvent',
                        'IssueCommentEvent',
                        'PullRequestReviewCommentEvent',
                        'CommitCommentEvent',
                        'PullRequestReviewEvent') and event_year = 2021
         GROUP BY 1
     ),

     raw as (
         SELECT
             name,
             stars.count AS star_count,
             prs.count AS pr_count,
             contributors.count as user_count
         FROM db_repos
                  LEFT JOIN stars ON stars.repo_name = name
                  LEFT JOIN prs ON prs.repo_name = name
                  LEFT JOIN contributors ON contributors.repo_name = name
     ),

     zz_pr as (
         SELECT AVG(pr_count) AS mean, STDDEV(pr_count) AS sd FROM raw
     ),

     zz_star as (
         SELECT AVG(star_count) AS mean, STDDEV(star_count) AS sd FROM raw
     ),

     zz_user as (
         SELECT AVG(user_count) AS mean, STDDEV(user_count) AS sd FROM raw
     )

SELECT name,
       ((star_count - zz_star.mean) / zz_star.sd) +
       ((user_count - zz_user.mean) / zz_user.sd) +
       ((pr_count - zz_pr.mean) / zz_pr.sd) AS z_score,
       ((star_count - zz_star.mean) / zz_star.sd) AS z_score_star,
       ((user_count - zz_user.mean) / zz_user.sd) AS z_score_user,
       ((pr_count - zz_pr.mean) / zz_pr.sd) AS z_score_pr
FROM raw,
     zz_star,
     zz_user,
     zz_pr
ORDER BY 2 DESC