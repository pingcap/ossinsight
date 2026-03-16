USE gharchive_dev;
SELECT
  `login` AS `user_login`,
  `followers` AS `followers`
FROM
  `github_users`
ORDER BY
  `followers` DESC
LIMIT
  ${top_n}
