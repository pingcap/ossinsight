---
title: "Web Framework Repos Landscape 2021"
image: /img/webframework.png
---

![](/img/webframework.png)

In this chapter, we will share with you some of the **top Web Framework repos (WF repos) on GitHub in 2021** measured by different metrics including the number of stars, PRs, contributors, countries, regions and so on. 
Note: 
1. You can move your cursor onto any of the repository bars/lines on the chart and get the exact number. 
2. The SQL commands below each chart are what we use on our TiDB Cloud to get the analytical results. Try those SQL commands by yourselves on TiDB Cloud with [this 10-minute tutorial](https://ossinsight.io/_/more/analyze-github-events-on-tidb-cloud-in-10-minutes).

## Star histories of top Web Framework repos since 2011

The number of stars is often thought of as a measure of whether a github repository is popular or not. We sort all web framework repositories from github by the total number of historical stars since 2011. For visualizing the results more intuitively, we show the top 10 open source databases by using an interactive line chart. 


<iframe  width="100%" height="400" scrolling="no"  src="/charts/webframework.html?theme=dark">
</iframe>

## Top 10 most starred Web Framework repos in 2021


<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT  wf.name as repo_name, count(*) as stars
    FROM github_events
         JOIN web_framework_repos wf ON wf.id = github_events.repo_id
   WHERE event_year = 2021 
         AND type = 'WatchEvent' 
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```
</details>

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22gin-gonic/gin%22,%22nestjs/nest%22,%22strapi/strapi%22,%22django/django%22,%22spring-projects/spring-boot%22,%22dotnet/aspnetcore%22,%22laravel/laravel%22,%22spring-projects/spring-framework%22,%22pallets/flask%22,%22fastify/fastify%22]&data=[10977,10695,10463,8295,7471,6807,5897,5395,5174,4962]&theme=vintage&label=Star">
</iframe>

## Top 10 Web Framework repos with the most PRs in 2021


<details>
 <summary>Click here to expand SQL</summary>

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
</details>

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22dotnet/aspnetcore%22,%22symfony/symfony%22,%22rails/rails%22,%22nestjs/nest%22,%22strapi/strapi%22,%22django/django%22,%22cakephp/cakephp%22,%22spring-projects/spring-boot%22,%22fastify/fastify%22,%22spring-projects/spring-framework%22]&data=[3177,2438,1875,1638,1479,1285,644,470,446,382]&theme=vintage&label=PR">
</iframe>

## Top 20 developers contributed the most PRs to Web Framework repos in 2021


<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT actor_login, count(*) as pr_count
    FROM github_events
         JOIN web_framework_repos wf ON wf.id = github_events.repo_id
   WHERE event_year = 2021 
         AND type = 'PullRequestEvent' 
         AND action = 'opened' 
         AND actor_login not like '%bot%'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 20
```
</details>

```
+----------------+----------+
| actor_login    | pr_count |
+----------------+----------+
| nicolas-grekas | 326      |
| othercorey     | 293      |
| soupette       | 279      |
| derrabus       | 265      |
| felixxm        | 201      |
| davidpdrsn     | 186      |
| dougbu         | 165      |
| pranavkm       | 163      |
| HaoK           | 139      |
| ADmad          | 138      |
| captainsafia   | 137      |
| BrennanConroy  | 130      |
| mfrachet       | 130      |
| scala-steward  | 125      |
| wtgodbe        | 125      |
| TanayParikh    | 119      |
| xabbuh         | 110      |
| fakeshadow     | 108      |
| jderusse       | 106      |
| JamesNK        | 104      |
+----------------+----------+
```

## Top 20 Web Framework repos with the highest YoY growth rate of stars in 2021


<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT wf.name,
         sum(event_year = 2020) AS stars2020,
         sum(event_year = 2021) AS stars2021,
         round(sum(event_year = 2021) / sum(event_year = 2020), 3) AS yoy
    FROM github_events
         JOIN web_framework_repos as wf on wf.id = github_events.repo_id
   WHERE type = 'WatchEvent' AND event_year in (2021, 2020)
GROUP BY wf.name
  HAVING stars2020 > 0 and yoy > 1
ORDER BY yoy DESC
   LIMIT 20
```
</details>

```
+----------------------+-----------+-----------+---------+
| name                 | stars2020 | stars2021 | yoy     |
+----------------------+-----------+-----------+---------+
| salvo-rs/salvo       | 3         | 385       | 128.333 |
| go-ozzo/ozzo-routing | 30        | 39        | 1.300   |
| adonisjs/core        | 2090      | 2683      | 1.284   |
| dotnet/aspnetcore    | 5990      | 6807      | 1.136   |
| fastify/fastify      | 4413      | 4962      | 1.124   |
| bmizerany/pat        | 72        | 80        | 1.111   |
| trezm/Thruster       | 181       | 199       | 1.099   |
| go-chi/chi           | 2062      | 2096      | 1.016   |
+----------------------+-----------+-----------+---------+

```

## Top 10 Web Framework repos with the lowest YoY growth rate of stars in 2021


<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT wf.name,
         sum(event_year = 2020) AS stars2020,
         sum(event_year = 2021) AS stars2021,
         round(sum(event_year = 2021) / sum(event_year = 2020), 3) AS yoy
    FROM github_events
         JOIN web_framework_repos as wf on wf.id = github_events.repo_id
   WHERE type = 'WatchEvent' AND event_year in (2021, 2020)
GROUP BY wf.name
  HAVING stars2020 > 0 and yoy < 1
ORDER BY yoy ASC
   LIMIT 10
```
</details>

```
+----------------------+-----------+-----------+-------+
| name                 | stars2020 | stars2021 | yoy   |
+----------------------+-----------+-----------+-------+
| System-Glitch/goyave | 676       | 165       | 0.244 |
| strongloop/loopback  | 474       | 196       | 0.414 |
| gogearbox/gearbox    | 419       | 190       | 0.453 |
| vardius/gorouter     | 36        | 18        | 0.500 |
| lukeed/polka         | 1052      | 526       | 0.500 |
| bcit-ci/CodeIgniter  | 688       | 370       | 0.538 |
| balderdashy/sails    | 1027      | 593       | 0.577 |
| htdangkhoa/pure-http | 104       | 60        | 0.577 |
| linnovate/mean       | 392       | 227       | 0.579 |
| go-martini/martini   | 597       | 354       | 0.593 |
+----------------------+-----------+-----------+-------+
```

## Top 10 most used programming languages in Web Framework repos in 2021


<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT language, count(*)
    FROM github_events
         JOIN web_framework_repos wf ON wf.id = github_events.repo_id
   WHERE event_year = 2021 AND type = 'PullRequestEvent' AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```
</details>


```
+------------+----------+
| language   | count(*) |
+------------+----------+
| PHP        | 3701     |
| C#         | 3177     |
| JavaScript | 2526     |
| TypeScript | 2157     |
| Ruby       | 1902     |
| Python     | 1546     |
| Rust       | 1098     |
| Java       | 852      |
| Go         | 790      |
| Scala      | 343      |
+------------+----------+
```

## Top 20 companies contributing the most to Web Framework repos in 2021


<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT trim(lower(replace(u.company, '@', ''))) AS company, 
         count(distinct actor_id) AS users_count
    FROM github_events
         JOIN web_framework_repos wf ON wf.id = github_events.repo_id
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
</details>

```
+-----------------------+-------------+
| company               | users_count |
+-----------------------+-------------+
| microsoft             | 256         |
| freelance             | 37          |
| freelancer            | 35          |
| shopify               | 34          |
| vmware                | 27          |
| google                | 24          |
| github                | 23          |
| red hat               | 17          |
| pivotal               | 15          |
| strapi                | 12          |
| self-employed         | 12          |
| ibm                   | 12          |
| netflix               | 10          |
| sap                   | 10          |
| tencent               | 10          |
| microsoft corporation | 10          |
| sensiolabs            | 9           |
| datadog               | 8           |
| facebook              | 8           |
| lightbend             | 8           |
+-----------------------+-------------+
```

## Top 10 countries/regions contributing the most to Web Framework repos in 2021


<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT country_code, 
         count(distinct actor_id) AS users_count
    FROM github_events
         JOIN web_framework_repos wf ON wf.id = github_events.repo_id
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
</details>

```
+--------------+-------------+
| US           | 2007        |
| DE           | 869         |
| FR           | 707         |
| CN           | 619         |
| GB           | 596         |
| IN           | 461         |
| RU           | 372         |
| CA           | 366         |
| BR           | 337         |
| NL           | 279         |
+--------------+-------------+
```

## The Rankings of Web Framework repos measured by Z-score in 2021

The analytical results displayed above are generated based on just one single metric of these three: stars, PRs, or contributors. Now, we will use the [Z-score](https://en.wikipedia.org/wiki/Standard_score) method to rank the WF repos on GitHub.  

<details>
 <summary>Click here to expand SQL</summary>

```sql
WITH stars AS (
    SELECT /*+ read_from_storage(tiflash[github_events]) */ 
        wf.name AS repo_name, 
        COUNT(*) AS count
    FROM github_events
    JOIN web_framework_repos wf ON wf.id = github_events.repo_id
    WHERE type = 'WatchEvent' and event_year = 2021
    GROUP BY 1 
),

prs as (
    SELECT /*+ read_from_storage(tiflash[github_events]) */ 
      wf.name AS repo_name, 
      COUNT(*) AS count
    FROM github_events
    JOIN web_framework_repos wf ON wf.id = github_events.repo_id
    WHERE type = 'PullRequestEvent' and event_year = 2021 and action = 'opened'
    GROUP BY 1 
),

contributors AS (
    SELECT /*+ read_from_storage(tiflash[github_events]) */ 
      wf.name AS repo_name, 
      count(distinct actor_id) AS count
    FROM github_events
    JOIN web_framework_repos wf ON wf.id = github_events.repo_id
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
    FROM web_framework_repos 
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
</details>

This is the comprehensive ranking calculated by z-score:
```
+----------------------------------+---------+--------------+--------------+------------+
| name                             | z_score | z_score_star | z_score_user | z_score_pr |
+----------------------------------+---------+--------------+--------------+------------+
| dotnet/aspnetcore                | 11.69   |  1.71        |  5.13        |  4.85      |
| strapi/strapi                    |  7.66   |  3.04        |  2.62        |  2.0       |
| nestjs/nest                      |  6.62   |  3.12        |  1.23        |  2.26      |
| symfony/symfony                  |  6.51   |  0.16        |  2.74        |  3.61      |
| rails/rails                      |  5.98   |  0.44        |  2.87        |  2.66      |
| django/django                    |  4.35   |  2.25        |  0.43        |  1.67      |
| spring-projects/spring-boot      |  4.06   |  1.95        |  1.8         |  0.31      |
| gin-gonic/gin                    |  3.35   |  3.23        |  0.32        | -0.19      |
| spring-projects/spring-framework |  2.75   |  1.2         |  1.39        |  0.16      |
| fastify/fastify                  |  1.42   |  1.04        |  0.11        |  0.27      |
| laravel/laravel                  |  1.11   |  1.38        | -0.16        | -0.11      |
| pallets/flask                    |  1.0    |  1.12        | -0.07        | -0.04      |
| expressjs/express                |  0.56   |  1.0         | -0.02        | -0.42      |
| SergioBenitez/rocket             |  0.44   |  0.66        |  0.05        | -0.27      |
| actix/actix-web                  |  0.33   |  0.28        | -0.04        |  0.09      |
| tokio-rs/axum                    |  0.03   |  0.26        | -0.3         |  0.07      |
| phoenixframework/phoenix         | -0.03   | -0.14        |  0.07        |  0.05      |
| labstack/echo                    | -0.24   |  0.24        | -0.17        | -0.31      |
| beego/beego                      | -0.26   |  0.06        | -0.14        | -0.18      |
| cakephp/cakephp                  | -0.29   | -0.65        | -0.23        |  0.6       |
| valyala/fasthttp                 | -0.39   |  0.22        | -0.27        | -0.33      |
| gogf/gf                          | -0.4    |  0.02        | -0.13        | -0.29      |
| adonisjs/core                    | -0.42   |  0.21        | -0.18        | -0.46      |
| meteor/meteor                    | -0.54   | -0.4         | -0.01        | -0.14      |
| seanmonstar/warp                 | -0.54   | -0.0         | -0.18        | -0.36      |
| yiisoft/yii2                     | -0.57   | -0.59        | -0.04        |  0.06      |
| gorilla/mux                      | -0.67   |  0.16        | -0.36        | -0.47      |
| go-chi/chi                       | -0.74   | -0.0         | -0.33        | -0.41      |
| playframework/playframework      | -0.77   | -0.61        | -0.25        |  0.09      |
| koajs/koa                        | -0.8    | -0.04        | -0.35        | -0.41      |
| feathersjs/feathers              | -1.02   | -0.47        | -0.27        | -0.27      |
| moleculerjs/moleculer            | -1.16   | -0.45        | -0.34        | -0.37      |
| actionhero/actionhero            | -1.16   | -0.72        | -0.48        |  0.04      |
| julienschmidt/httprouter         | -1.17   | -0.23        | -0.47        | -0.47      |
| tinyhttp/tinyhttp                | -1.2    | -0.4         | -0.41        | -0.4       |
| rustasync/tide                   | -1.24   | -0.45        | -0.37        | -0.42      |
| balderdashy/sails                | -1.28   | -0.55        | -0.3         | -0.44      |
| hapijs/hapi                      | -1.29   | -0.47        | -0.39        | -0.43      |
| slimphp/Slim                     | -1.39   | -0.59        | -0.41        | -0.39      |
| htdangkhoa/pure-http             | -1.44   | -0.74        | -0.5         | -0.2       |
| sinatra/sinatra                  | -1.45   | -0.59        | -0.43        | -0.44      |
| bcit-ci/CodeIgniter              | -1.46   | -0.63        | -0.38        | -0.45      |
| salvo-rs/salvo                   | -1.51   | -0.62        | -0.49        | -0.4       |
| lukeed/polka                     | -1.51   | -0.57        | -0.47        | -0.47      |
| restify/node-restify             | -1.54   | -0.62        | -0.46        | -0.46      |
| trillium-rs/trillium             | -1.54   | -0.69        | -0.48        | -0.37      |
| linnovate/mean                   | -1.56   | -0.68        | -0.42        | -0.45      |
| gotham-rs/gotham                 | -1.56   | -0.68        | -0.48        | -0.4       |
| emicklei/go-restful              | -1.57   | -0.63        | -0.48        | -0.46      |
| astaxie/beego                    | -1.61   | -0.63        | -0.51        | -0.47      |
| go-martini/martini               | -1.62   | -0.63        | -0.51        | -0.48      |
| gogearbox/gearbox                | -1.63   | -0.69        | -0.49        | -0.45      |
| strongloop/loopback              | -1.64   | -0.69        | -0.47        | -0.48      |
| trezm/Thruster                   | -1.64   | -0.69        | -0.5         | -0.45      |
| urfave/negroni                   | -1.64   | -0.65        | -0.51        | -0.48      |
| System-Glitch/goyave             | -1.66   | -0.7         | -0.5         | -0.46      |
| savsgio/atreugo                  | -1.67   | -0.68        | -0.5         | -0.48      |
| fasthttp/router                  | -1.68   | -0.72        | -0.49        | -0.47      |
| totaljs/framework                | -1.7    | -0.72        | -0.5         | -0.48      |
| ant0ine/go-json-rest             | -1.72   | -0.73        | -0.51        | -0.48      |
| bmizerany/pat                    | -1.72   | -0.73        | -0.5         | -0.48      |
| dimfeld/httptreemux              | -1.72   | -0.74        | -0.5         | -0.48      |
| go-ozzo/ozzo-routing             | -1.73   | -0.75        | -0.5         | -0.48      |
| vardius/gorouter                 | -1.74   | -0.76        | -0.51        | -0.47      |
+----------------------------------+---------+--------------+--------------+------------+
```
