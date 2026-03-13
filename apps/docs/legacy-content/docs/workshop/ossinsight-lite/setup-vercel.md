---
title: 'Step 3: Setup Dashboard with Vercel'
sidebar_position: 4
---

1. With the data synced to TiDB Cloud, use your preferred SQL client to connect to the TiDB database using the connection information provided in Step 2.
2. Start querying the data to get insights on repositories. Some sample SQL queries you might use to explore the data are:
For example, to calculate how many contributors for repo:

```sql
SELECT
  COUNT(DISTINCT `id`)
FROM
  `users`;
```

To find out how many open issues: 

```sql
SELECT repos.owner, repos.name, COUNT(*) as open_issue_count
FROM repos
JOIN issues ON repos.id = issues.repo_id
WHERE issues.closed = 0
GROUP BY repos.owner, repos.name
ORDER BY open_issue_count DESC;
```

To find out the average followers count of the users who starred in this repo:

```sql
SELECT
  AVG(users.`followers_count`)
FROM
  `starred_repos`
  JOIN `users` ON `starred_repos`.`user_id` = `users`.`id`;
```
