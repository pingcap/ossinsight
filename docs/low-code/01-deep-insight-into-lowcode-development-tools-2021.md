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

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22facebook/react%22,%22sveltejs/svelte%22,%22vuejs/vue%22,%22angular/angular%22,%22solidjs/solid%22,%22vuejs/core%22,%22alpinejs/alpine%22,%22preactjs/preact%22,%22jquery/jquery%22,%22hotwired/stimulus%22]&data=[22830,18573,18015,11037,8607,8322,6993,2965,2227,1355]&theme=vintage">
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

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22angular/angular%22,%22facebook/react%22,%22vuejs/core%22,%22sveltejs/svelte%22,%22neomjs/neo%22,%22emberjs/ember.js%22,%22preactjs/preact%22,%22alpinejs/alpine%22,%22vuejs/vue%22,%22aurelia/aurelia%22]&data=[2238,1178,878,436,380,372,290,256,164,160]&theme=vintage">
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
+-------------------+----------+
| actor_login       | pr_count |
+-------------------+----------+
| tobiu             | 373      |
| bvaughn           | 202      |
| gkalpak           | 200      |
| acdlite           | 195      |
| josephperrott     | 158      |
| atscott           | 138      |
| HcySunYang        | 106      |
| petebacondarwin   | 105      |
| bigopon           | 98       |
| sebmarkbage       | 88       |
| edison1105        | 82       |
| AndrewKushnir     | 82       |
| crisbeto          | 78       |
| JoviDeCroock      | 77       |
| devversion        | 77       |
| alxhub            | 75       |
| alan-agius4       | 75       |
| dario-piotrowicz  | 74       |
| JoostK            | 66       |
| marvinhagemeister | 63       |
+-------------------+----------+
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
+-----------------+-----------+-----------+-------+
| name            | stars2020 | stars2021 | yoy   |
+-----------------+-----------+-----------+-------+
| solidjs/solid   | 3447      | 8607      | 2.497 |
| sveltejs/svelte | 13527     | 18573     | 1.373 |
| marko-js/marko  | 735       | 1006      | 1.369 |
| spine/spine     | 64        | 69        | 1.078 |
+-----------------+-----------+-----------+-------+

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
+-----------------------+-----------+-----------+-------+
| name                  | stars2020 | stars2021 | yoy   |
+-----------------------+-----------+-----------+-------+
| jorgebucaran/hyperapp | 1498      | 691       | 0.461 |
| aurelia/framework     | 518       | 259       | 0.500 |
| optimizely/nuclear-js | 78        | 40        | 0.513 |
| daemonite/material    | 186       | 97        | 0.522 |
| aurelia/aurelia       | 369       | 208       | 0.564 |
| polymer/lit-element   | 1120      | 635       | 0.567 |
| alpinejs/alpine       | 12006     | 6993      | 0.582 |
| tastejs/todomvc       | 1376      | 813       | 0.591 |
| finom/seemple         | 42        | 25        | 0.595 |
| angular/angular.js    | 1207      | 724       | 0.600 |
+-----------------------+-----------+-----------+-------+
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
| TypeScript | 4006     |
| JavaScript | 2678     |
| HTML       | 210      |
| CSS        | 8        |
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
+--------------+-------------+
| company      | users_count |
+--------------+-------------+
| google       | 47          |
| facebook     | 30          |
| freelancer   | 16          |
| microsoft    | 16          |
| linkedin     | 15          |
| freelance    | 13          |
| tencent      | 13          |
| bytedance    | 9           |
| alibaba      | 8           |
| home         | 7           |
| esri         | 7           |
| student      | 6           |
| shopify      | 5           |
| adobe        | 5           |
| baidu        | 5           |
| accenture    | 5           |
| epam systems | 5           |
| ibm          | 5           |
| mozilla      | 4           |
| angular      | 4           |
+--------------+-------------+
```

## Top countries contributing to OSS lowcode development tools

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
| US           | 1120        |
| CN           | 430         |
| DE           | 388         |
| IN           | 290         |
| GB           | 288         |
| FR           | 229         |
| CA           | 186         |
| RU           | 159         |
| AU           | 154         |
| BR           | 122         |
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
+-----------------------+---------+--------------+--------------+------------+
| name                  | z_score | z_score_star | z_score_user | z_score_pr |
+-----------------------+---------+--------------+--------------+------------+
| angular/angular       |  8.94   |  1.2         |  3.36        |  4.38      |
| facebook/react        |  8.26   |  3.13        |  3.06        |  2.07      |
| sveltejs/svelte       |  4.26   |  2.44        |  1.37        |  0.45      |
| vuejs/core            |  3.67   |  0.76        |  1.49        |  1.41      |
| vuejs/vue             |  2.93   |  2.35        |  0.73        | -0.14      |
| alpinejs/alpine       |  0.57   |  0.54        | -0.02        |  0.06      |
| solidjs/solid         |  0.25   |  0.81        | -0.25        | -0.31      |
| preactjs/preact       | -0.11   | -0.12        | -0.12        |  0.13      |
| emberjs/ember.js      | -0.38   | -0.49        | -0.2         |  0.31      |
| ionic-team/stencil    | -0.49   | -0.39        |  0.12        | -0.21      |
| neomjs/neo            | -0.66   | -0.47        | -0.52        |  0.33      |
| jquery/jquery         | -0.96   | -0.24        | -0.33        | -0.39      |
| hotwired/stimulus     | -1.09   | -0.38        | -0.34        | -0.36      |
| aurelia/aurelia       | -1.16   | -0.57        | -0.44        | -0.15      |
| marko-js/marko        | -1.27   | -0.44        | -0.47        | -0.37      |
| polymer/lit-element   | -1.35   | -0.5         | -0.41        | -0.43      |
| angular/angular.js    | -1.37   | -0.49        | -0.43        | -0.45      |
| mithriljs/mithril.js  | -1.4    | -0.49        | -0.45        | -0.46      |
| jorgebucaran/hyperapp | -1.41   | -0.49        | -0.49        | -0.43      |
| tastejs/todomvc       | -1.43   | -0.47        | -0.48        | -0.47      |
| knockout/knockout     | -1.51   | -0.55        | -0.48        | -0.49      |
| Polymer/polymer       | -1.52   | -0.53        | -0.5         | -0.49      |
| riot/riot             | -1.54   | -0.54        | -0.5         | -0.5       |
| jashkenas/backbone    | -1.56   | -0.54        | -0.52        | -0.5       |
| aurelia/framework     | -1.58   | -0.56        | -0.52        | -0.49      |
| dojo/dojo             | -1.6    | -0.59        | -0.51        | -0.5       |
| daemonite/material    | -1.6    | -0.59        | -0.52        | -0.48      |
| spine/spine           | -1.63   | -0.59        | -0.54        | -0.5       |
| optimizely/nuclear-js | -1.63   | -0.6         | -0.53        | -0.5       |
| finom/seemple         | -1.64   | -0.6         | -0.54        | -0.5       |
+-----------------------+---------+--------------+--------------+------------+
```
