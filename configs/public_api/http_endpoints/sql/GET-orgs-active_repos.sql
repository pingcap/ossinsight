USE gharchive_dev;
SELECT
  r.repo_id,
  r.repo_name,
  r.stars,
  r.forks,
  r.created_at,
  SUM(
    CASE
      WHEN type = 'PullRequestEvent'
      AND action = 'opened' THEN 1
      ELSE 0
    END
  ) AS pull_request_count,
  SUM(
    CASE
      WHEN type = 'PushEvent' THEN 1
      ELSE 0
    END
  ) AS push_count,
  SUM(
    CASE
      WHEN type = 'IssuesEvent' THEN 1
      ELSE 0
    END
  ) AS issue_count
FROM
  github_events g
  LEFT JOIN github_repos r ON r.repo_id = g.repo_id
WHERE
  r.owner_login = ${org_name}
  AND (
    type = 'PullRequestEvent'
    OR type = 'PushEvent'
    OR type = 'IssuesEvent'
  )
  AND g.created_at > DATE_SUB(NOW(), INTERVAL ${past_month} Month)
GROUP BY
  r.repo_id, r.repo_name, r.stars, r.forks, r.created_at
ORDER BY
  (pull_request_count * 0.5 + push_count * 0.25 + issue_count * 0.25) DESC
LIMIT
  ${top_n}
