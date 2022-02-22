---
title: "OSS Web Framework Analysis: 2021"
image: /img/webframework.png
---


![](/img/webframework.png)

## Datasets

We have collected a list of well-known open source repos in the field of web frameworks, mainly including: Rails, Django, Laravel, Spring Boot, Gin, etc. If the repo you care about is not on the list, you can submit a [pull request](https://github.com/hooopo/gharchive/blob/main/meta/repos/web_framework_repos.yml) to improve it.

The full list of web framework repositories participating in statistics includes

```
+-----------+----------------------------------+
| id        | name                             |
+-----------+----------------------------------+
| 6296790   | spring-projects/spring-boot      |
| 8514      | rails/rails                      |
| 1863329   | laravel/laravel                  |
| 458058    | symfony/symfony                  |
| 4164482   | django/django                    |
| 596892    | pallets/flask                    |
| 134266604 | savsgio/atreugo                  |
| 44344606  | go-chi/chi                       |
| 31504491  | labstack/echo                    |
| 153124788 | fasthttp/router                  |
| 44498957  | valyala/fasthttp                 |
| 258661876 | gogearbox/gearbox                |
| 20904437  | gin-gonic/gin                    |
| 95761244  | gogf/gf                          |
| 8282363   | ant0ine/go-json-rest             |
| 45007925  | go-ozzo/ozzo-routing             |
| 6701057   | emicklei/go-restful              |
| 6051812   | gorilla/mux                      |
| 63337769  | vardius/gorouter                 |
| 216532683 | System-Glitch/goyave             |
| 14956897  | julienschmidt/httprouter         |
| 19794492  | dimfeld/httptreemux              |
| 13975314  | go-martini/martini               |
| 19922293  | urfave/negroni                   |
| 3269762   | bmizerany/pat                    |
| 105379569 | actix/actix-web                  |
| 372172254 | tokio-rs/axum                    |
| 98018486  | gotham-rs/gotham                 |
| 54168759  | SergioBenitez/rocket             |
| 108700097 | trezm/Thruster                   |
| 144025834 | rustasync/tide                   |
| 140609832 | seanmonstar/warp                 |
| 220185454 | salvo-rs/salvo                   |
| 332323752 | trillium-rs/trillium             |
| 237159    | expressjs/express                |
| 80945428  | nestjs/nest                      |
| 3214406   | meteor/meteor                    |
| 43441403  | strapi/strapi                    |
| 11551538  | koajs/koa                        |
| 3757512   | balderdashy/sails                |
| 69495170  | fastify/fastify                  |
| 2609642   | feathersjs/feathers              |
| 2163263   | hapijs/hapi                      |
| 9325315   | strongloop/loopback              |
| 10219106  | linnovate/mean                   |
| 40772809  | adonisjs/core                    |
| 1661758   | restify/node-restify             |
| 115081766 | lukeed/polka                     |
| 82289483  | moleculerjs/moleculer            |
| 7190749   | totaljs/framework                |
| 2491877   | actionhero/actionhero            |
| 271918885 | tinyhttp/tinyhttp                |
| 309177904 | htdangkhoa/pure-http             |
| 16072585  | phoenixframework/phoenix         |
| 106995    | sinatra/sinatra                  |
| 656494    | cakephp/cakephp                  |
| 17620347  | dotnet/aspnetcore                |
| 1148753   | spring-projects/spring-framework |
| 2340549   | playframework/playframework      |
| 3431193   | yiisoft/yii2                     |
| 926544    | slimphp/Slim                     |
| 2234102   | bcit-ci/CodeIgniter              |
| 3577919   | beego/beego                      |
+-----------+----------------------------------+
```

## Stars histories of top OSS web framework since 2011
<iframe  width="100%" height="350" scrolling="no"  src="https://staticsiteg.github.io/echarts/racing-webframework.html?theme=dark">
</iframe>

## Top 10 repos by stars in 2021

```sql
  SELECT wf.name as repo_name, count(*) as stars
    FROM github_events
         JOIN web_framework_repos wf ON wf.id = github_events.repo_id
   WHERE event_year = 2021 
         AND type = 'WatchEvent' 
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```

<iframe  width="100%" height="350" scrolling="no"  src="https://staticsiteg.github.io/echarts/bar.html?x=[%22clickhouse/clickhouse%22,%20%22redis/redis%22,%20%22prometheus/prometheus%22,%20%22elastic/elasticsearch%22,%20%22questdb/questdb%22,%20%22etcd-io/etcd%22,%20%22pingcap/tidb%22,%20%22apache/spark%22,%20%22cockroachdb/cockroach%22,%20%22facebook/rocksdb%22]&data=[7628,%206313,%205898,%205669,%205505,%204524,%203967,%203833,%203311,%203190]&theme=vintage">
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

<iframe  width="100%" height="350" scrolling="no"  src="https://staticsiteg.github.io/echarts/bar.html?x=[%22elastic/elasticsearch%22,%20%22clickhouse/clickhouse%22,%20%22cockroachdb/cockroach%22,%20%22pingcap/tidb%22,%20%22apache/spark%22,%20%22taosdata/TDengine%22,%20%22apache/flink%22,%20%22MaterializeInc/materialize%22,%20%22trinodb/trino%22,%20%22arangodb/arangodb%22]&data=[10433,%209689,%207204,%204777,%203703,%203542,%203338,%202883,%202334,%201663]&theme=vintage">
</iframe>

## Top Developers for OSS web framework

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

## OSS web framwork repos with the highest growth YoY

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

## OSS web framwork repos with lowest growth YoY

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

## Top Language for OSS web framework

```sql
  SELECT language, count(*)
    FROM github_events
         JOIN web_framework_repos wf ON wf.id = github_events.repo_id
   WHERE event_year = 2021 AND type = 'PullRequestEvent' AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```


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

## Top companies contributing to OSS web frameworks

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

## Top countries contributing to OSS web frameworks

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

## OSS web framework ranking

The previous analysis is for a single dimension. Let’s analyze the comprehensive measurement. The open source web framework community is comprehensively scored through the three metrics: stars, PRs and contributors. We can use the [Z-score](https://en.wikipedia.org/wiki/Standard_score) method to score the repo.

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
