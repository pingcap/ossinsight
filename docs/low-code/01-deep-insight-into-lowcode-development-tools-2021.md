---
title: "Deep Insight Into Lowcode Development Tools: 2021"
image: /img/lowcode.png
---

![](/img/lowcode.png)

## Stars histories of top OSS lowcode development tools since 2011
<iframe  width="100%" height="400" scrolling="no"  src="/charts/lowcode.html?theme=dark">
</iframe>

## Top 10 repos by stars in 2021

```sql
  SELECT jf.name as repo_name, count(*) as stars
    FROM github_events
         JOIN nocode_repos jf ON jf.id = github_events.repo_id
   WHERE event_year = 2021 
         AND type = 'WatchEvent' 
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22tiangolo/fastapi%22,%22supabase/supabase%22,%22nocodb/nocodb%22,%22appwrite/appwrite%22,%22strapi/strapi%22,%22appsmithorg/appsmith%22,%22Budibase/budibase%22,%22n8n-io/n8n%22,%22hasura/graphql-engine%22,%22saleor/saleor%22]&data=[21792,20723,16498,10772,10463,9531,7994,7930,5522,5326]&theme=vintage&label=Star">
</iframe>

## Top 10 repos by PR in 2021

```sql
  SELECT wf.name AS repo_name,
         COUNT(*) AS num
    FROM github_events 
         JOIN web_framework_repos wf ON wf.id = github_events.repo_id
   WHERE type = 'PullRequestEvent' AND event_year = 2021 AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22appsmithorg/appsmith%22,%22directus/directus%22,%22keystonejs/keystone%22,%22strapi/strapi%22,%22saleor/saleor%22,%22cube-js/cube.js%22,%22n8n-io/n8n%22,%22supabase/supabase%22,%22TryGhost/Ghost%22,%22appwrite/appwrite%22]&data=[2799,2467,1811,1479,1443,1350,940,882,866,689]&theme=vintage&label=PR">
</iframe>

## Top Developers for OSS lowcode development tools

```sql
  SELECT actor_login, count(*) as pr_count
    FROM github_events
         JOIN nocode_repos wf ON wf.id = github_events.repo_id
   WHERE event_year = 2021 
         AND type = 'PullRequestEvent' 
         AND action = 'opened' 
         AND actor_login not like '%bot%'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 20
```

```
+------------------+----------+
| actor_login      | pr_count |
+------------------+----------+
| rijkvanzanten    | 682      |
| timleslie        | 573      |
| ovr              | 376      |
| soupette         | 279      |
| IKarbowiak       | 224      |
| hassankhan       | 193      |
| mitchellhamilton | 192      |
| rishabhsaxena    | 191      |
| sharat87         | 178      |
| brunozoric       | 178      |
| TorstenDittmann  | 176      |
| RicardoE105      | 166      |
| nidhi-nair       | 165      |
| ivov             | 164      |
| hetunandu        | 158      |
| mike12345567     | 149      |
| vasilev-alex     | 147      |
| ilya-biryukov    | 145      |
| azrikahar        | 143      |
| korycins         | 141      |
+------------------+----------+
```

## OSS lowcode development repos with the highest growth YoY

```sql
  SELECT wf.name,
         sum(event_year = 2020) AS stars2020,
         sum(event_year = 2021) AS stars2021,
         round(sum(event_year = 2021) / sum(event_year = 2020), 3) AS yoy
    FROM github_events
         JOIN nocode_repos as wf on wf.id = github_events.repo_id
   WHERE type = 'WatchEvent' AND event_year in (2021, 2020)
GROUP BY wf.name
  HAVING stars2020 > 0 and yoy > 1
ORDER BY yoy DESC
   LIMIT 20
```

```
+----------------------+-----------+-----------+--------+
| name                 | stars2020 | stars2021 | yoy    |
+----------------------+-----------+-----------+--------+
| nocodb/nocodb        | 370       | 16498     | 44.589 |
| Budibase/budibase    | 407       | 7994      | 19.641 |
| appsmithorg/appsmith | 1250      | 9531      | 7.625  |
| appwrite/appwrite    | 2106      | 10772     | 5.115  |
| supabase/supabase    | 4722      | 20723     | 4.389  |
| saleor/saleor        | 4060      | 5326      | 1.312  |
| n8n-io/n8n           | 6342      | 7930      | 1.250  |
| keystonejs/keystone  | 1944      | 2302      | 1.184  |
| rowyio/rowy          | 968       | 1121      | 1.158  |
| tiangolo/fastapi     | 19519     | 21792     | 1.116  |
+----------------------+-----------+-----------+--------+

```

## OSS lowcode development repos with lowest growth YoY

```sql
  SELECT wf.name,
         sum(event_year = 2020) AS stars2020,
         sum(event_year = 2021) AS stars2021,
         round(sum(event_year = 2021) / sum(event_year = 2020), 3) AS yoy
    FROM github_events
         JOIN nocode_repos as wf on wf.id = github_events.repo_id
   WHERE type = 'WatchEvent' AND event_year in (2021, 2020)
GROUP BY wf.name
  HAVING stars2020 > 0 and yoy < 1
ORDER BY yoy ASC
   LIMIT 10
```

```
+------------------------------+-----------+-----------+-------+
| name                         | stars2020 | stars2021 | yoy   |
+------------------------------+-----------+-----------+-------+
| webiny/webiny-js             | 2496      | 1014      | 0.406 |
| graphile/postgraphile        | 1688      | 1297      | 0.768 |
| strapi/strapi                | 12868     | 10463     | 0.813 |
| cube-js/cube.js              | 2912      | 2368      | 0.813 |
| hasura/graphql-engine        | 6508      | 5522      | 0.848 |
| parse-community/parse-server | 1368      | 1218      | 0.890 |
| TryGhost/Ghost               | 4446      | 3978      | 0.895 |
| directus/directus            | 4237      | 3989      | 0.941 |
| artf/grapesjs                | 2685      | 2663      | 0.992 |
+------------------------------+-----------+-----------+-------+
```

## Top Language for OSS lowcode development tools

```sql
  SELECT language, count(*)
    FROM github_events
         JOIN nocode_repos wf ON wf.id = github_events.repo_id
   WHERE event_year = 2021 AND type = 'PullRequestEvent' AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```


```
+------------+----------+
| language   | count(*) |
+------------+----------+
| TypeScript | 9087     |
| JavaScript | 5453     |
| Python     | 1938     |
| Vue        | 632      |
| Rust       | 555      |
| Haskell    | 125      |
| PHP        | 4        |
+------------+----------+
```

## Top companies contributing to OSS lowcode development tools

```sql
  SELECT trim(lower(replace(u.company, '@', ''))) AS company, 
         count(distinct actor_id) AS users_count
    FROM github_events
         JOIN nocode_repos wf ON wf.id = github_events.repo_id
         JOIN users u ON u.login = github_events.actor_login 
   WHERE event_year = 2021 
         AND github_events.type IN (
           'IssuesEvent', 
           'PullRequestEvent', 
           'IssueCommentEvent', 
           'PullRequestReviewCommentEvent', 
           'CommitCommentEvent', 
           'PullRequestReviewEvent'
         )
         AND u.company IS NOT NULL 
         AND u.company != '' 
         AND u.company != 'none'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 20
```

```
+------------------+-------------+
| company          | users_count |
+------------------+-------------+
| hasura           | 25          |
| freelance        | 24          |
| freelancer       | 14          |
| microsoft        | 12          |
| strapi           | 12          |
| mirumee          | 9           |
| thinkmill        | 8           |
| mirumee software | 6           |
| student          | 6           |
| ibm              | 6           |
| tryghost         | 6           |
| google           | 6           |
| sap              | 5           |
| budibase         | 5           |
| red hat          | 5           |
| webiny           | 5           |
| home             | 4           |
| facebook         | 4           |
| gojek            | 4           |
| thoughtworks     | 4           |
+------------------+-------------+
```

## Top countries or regions contributing to OSS lowcode development tools

```sql
  SELECT country_code, 
         count(distinct actor_id) AS users_count
    FROM github_events
         JOIN nocode_repos wf ON wf.id = github_events.repo_id
         JOIN users u ON u.login = github_events.actor_login 
   WHERE event_year = 2021 
         AND github_events.type IN (
           'IssuesEvent', 
           'PullRequestEvent', 
           'IssueCommentEvent', 
           'PullRequestReviewCommentEvent', 
           'CommitCommentEvent', 
           'PullRequestReviewEvent'
         )
         AND country_code is not null
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```

```
+--------------+-------------+
| country_code | users_count |
+--------------+-------------+
| US           | 978         |
| IN           | 498         |
| DE           | 425         |
| FR           | 316         |
| GB           | 302         |
| BR           | 191         |
| CA           | 188         |
| RU           | 145         |
| CN           | 134         |
| AU           | 133         |
+--------------+-------------+
```

## OSS lowcode development tool ranking

The previous analysis is for a single dimension. Let’s analyze the comprehensive measurement. The open source lowcode development tool community is comprehensively scored through the three metrics: stars, PRs and contributors. We can use the [Z-score](https://en.wikipedia.org/wiki/Standard_score) method to score the repo.

```sql
WITH stars AS (
    SELECT /*+ read_from_storage(tiflash[github_events]) */ 
        wf.name AS repo_name, 
        COUNT(*) AS count
    FROM github_events
    JOIN nocode_repos wf ON wf.id = github_events.repo_id
    WHERE type = 'WatchEvent' and event_year = 2021
    GROUP BY 1 
),

prs as (
    SELECT /*+ read_from_storage(tiflash[github_events]) */ 
      wf.name AS repo_name, 
      COUNT(*) AS count
    FROM github_events
    JOIN nocode_repos wf ON wf.id = github_events.repo_id
    WHERE type = 'PullRequestEvent' and event_year = 2021 and action = 'opened'
    GROUP BY 1 
),

contributors AS (
    SELECT /*+ read_from_storage(tiflash[github_events]) */ 
      wf.name AS repo_name, 
      count(distinct actor_id) AS count
    FROM github_events
    JOIN nocode_repos wf ON wf.id = github_events.repo_id
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
        COALESCE(prs.count, 0) AS pr_count,
        contributors.count as user_count
    FROM nocode_repos 
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
      round(((star_count - zz_star.mean) / zz_star.sd) +
      ((user_count - zz_user.mean) / zz_user.sd) +
      ((pr_count - zz_pr.mean) / zz_pr.sd), 2) AS z_score,
      round((star_count - zz_star.mean) / zz_star.sd, 2) AS z_score_star,
      round((user_count - zz_user.mean) / zz_user.sd, 2) AS z_score_user,
      round((pr_count - zz_pr.mean) / zz_pr.sd, 2) AS z_score_pr
FROM raw, 
    zz_star,
    zz_user,
    zz_pr
ORDER BY 2 DESC
```
This is the comprehensive ranking calculated by z-score:
```
+------------------------------+---------+--------------+--------------+------------+
| name                         | z_score | z_score_star | z_score_user | z_score_pr |
+------------------------------+---------+--------------+--------------+------------+
| tiangolo/fastapi             |  4.33   |  2.39        |  2.45        | -0.51      |
| strapi/strapi                |  3.92   |  0.56        |  2.6         |  0.77      |
| appsmithorg/appsmith         |  2.88   |  0.4         | -0.01        |  2.49      |
| supabase/supabase            |  2.68   |  2.22        |  0.47        | -0.01      |
| directus/directus            |  2.3    | -0.49        |  0.73        |  2.06      |
| appwrite/appwrite            |  0.41   |  0.61        |  0.06        | -0.26      |
| nocodb/nocodb                |  0.06   |  1.53        | -0.49        | -0.98      |
| hasura/graphql-engine        |  0.02   | -0.25        |  1.26        | -1.0       |
| saleor/saleor                |  0.0    | -0.28        | -0.44        |  0.72      |
| keystonejs/keystone          | -0.15   | -0.77        | -0.58        |  1.2       |
| n8n-io/n8n                   | -0.17   |  0.14        | -0.38        |  0.07      |
| cube-js/cube.js              | -0.53   | -0.76        | -0.37        |  0.6       |
| Budibase/budibase            | -0.75   |  0.16        | -0.57        | -0.33      |
| TryGhost/Ghost               | -0.88   | -0.5         | -0.35        | -0.03      |
| ToolJet/ToolJet              | -1.5    | -0.45        | -0.69        | -0.36      |
| artf/grapesjs                | -2.2    | -0.71        | -0.42        | -1.07      |
| parse-community/parse-server | -2.3    | -0.94        | -0.63        | -0.72      |
| webiny/webiny-js             | -2.39   | -0.98        | -0.85        | -0.56      |
| rowyio/rowy                  | -2.84   | -0.96        | -0.93        | -0.95      |
| graphile/postgraphile        | -2.89   | -0.93        | -0.85        | -1.11      |
+------------------------------+---------+--------------+--------------+------------+
```
