---
title: "Deep Insight About OSS Database: 2021"
image: /img/gharchive-title-img.png
---


![](/img/gharchive-title-img.png)


## Stars histories of top OSS database since 2011
<iframe  width="100%" height="400" scrolling="no"  src="/charts/database.html?theme=dark">
</iframe>

## Top 10 repos by stars in 2021

```sql
  SELECT db.name as repo_name, count(*) as stars
    FROM github_events
         JOIN db_repos db ON db.id = github_events.repo_id
   WHERE event_year = 2021 
         AND type = 'WatchEvent' 
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22clickhouse/clickhouse%22,%20%22redis/redis%22,%20%22prometheus/prometheus%22,%20%22elastic/elasticsearch%22,%20%22questdb/questdb%22,%20%22etcd-io/etcd%22,%20%22pingcap/tidb%22,%20%22apache/spark%22,%20%22cockroachdb/cockroach%22,%20%22facebook/rocksdb%22]&data=[7628,%206313,%205898,%205669,%205505,%204524,%203967,%203833,%203311,%203190]&theme=vintage">
</iframe>

## Top 10 repos by PR in 2021

```sql
  SELECT db_repos.name AS repo_name,
         COUNT(*) AS num
    FROM github_events 
         JOIN db_repos ON db_repos.id = github_events.repo_id
   WHERE type = 'PullRequestEvent' AND event_year = 2021 AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22elastic/elasticsearch%22,%20%22clickhouse/clickhouse%22,%20%22cockroachdb/cockroach%22,%20%22pingcap/tidb%22,%20%22apache/spark%22,%20%22taosdata/TDengine%22,%20%22apache/flink%22,%20%22MaterializeInc/materialize%22,%20%22trinodb/trino%22,%20%22arangodb/arangodb%22]&data=[10433,%209689,%207204,%204777,%203703,%203542,%203338,%202883,%202334,%201663]&theme=vintage">
</iframe>

## Top Developers for OSS Databases

```sql
  SELECT actor_login, count(*) as pr_count
    FROM github_events
         JOIN db_repos db ON db.id = github_events.repo_id
   WHERE event_year = 2021 
         AND type = 'PullRequestEvent' 
         AND action = 'opened' 
         AND actor_login not like '%bot%'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 20
```

| Avatar |actor_login        | bar               | pr_count
|-------| ------------------ | ----------------- | --------
|![](https://avatars.githubusercontent.com/u/40268737?s=40&v=4) |[jrodewig](https://github.com/jrodewig)           | ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ | 1586
|![](https://avatars.githubusercontent.com/u/825729?s=40&v=4) |[sangshuduo](https://github.com/sangshuduo)          | ▇▇▇▇▇▇▇▇          | 703
|![](https://avatars.githubusercontent.com/u/1423118?v=4&s=40) |[jsteemann](https://github.com/jsteemann)          | ▇▇▇▇▇▇▇           | 652
|![](https://avatars.githubusercontent.com/u/6490959?v=4&s=40) |[original-brownbear](https://github.com/original-brownbear) | ▇▇▇▇▇▇▇           | 615
|![](https://avatars.dicebear.com/api/identicon/alexey-milovidov.svg?size=40) |[alexey-milovidov](https://github.com/alexey-milovidov)   | ▇▇▇▇▇▇            | 542
|![](https://avatars.githubusercontent.com/u/5135385?v=4&s=40) |[yuzefovich](https://github.com/yuzefovich)        | ▇▇▇▇▇             | 471
|![](https://avatars.dicebear.com/api/identicon/azat.svg?size=40) |[azat](https://github.com/azat)               | ▇▇▇▇▇             | 455
|![](https://avatars.githubusercontent.com/u/882976?v=4&s=40) |[benesch](https://github.com/benesch)            | ▇▇▇▇▇             | 422
|![](https://avatars.githubusercontent.com/u/144328?v=4&s=40) |[findepi](https://github.com/findepi)           | ▇▇▇▇              | 378
|![](https://avatars.githubusercontent.com/u/3646147?v=4&s=40) |[otan](https://github.com/otan)               | ▇▇▇▇              | 375
|![](https://avatars.githubusercontent.com/u/4357155?v=4&s=40) |[benwtrent](https://github.com/benwtrent)          | ▇▇▇▇              | 345
|![](https://avatars.githubusercontent.com/u/5058284?v=4&s=40) |[DaveCTurner](https://github.com/DaveCTurner)        | ▇▇▇               | 323
|![](https://avatars.githubusercontent.com/u/2755881?v=4&s=40) |[danxmoran](https://github.com/danxmoran)         | ▇▇▇               | 317
|![](https://avatars.githubusercontent.com/u/38700?v=4&s=40) |[mfussenegger](https://github.com/mfussenegger)       | ▇▇▇               | 309
|![](https://avatars.githubusercontent.com/u/215970?v=4&s=40) |[nik9000](https://github.com/nik9000)            | ▇▇▇               | 298
|![](https://avatars.githubusercontent.com/u/1320573?v=4&s=40) |[rafiss](https://github.com/rafiss)             | ▇▇▇               | 295
|![](https://avatars.githubusercontent.com/u/12521043?v=4&s=40) |[JimGalasyn](https://github.com/JimGalasyn)         | ▇▇▇               | 295
|![](https://avatars.githubusercontent.com/u/5076964?v=4&s=40) |[tbg](https://github.com/tbg)                | ▇▇▇               | 288
|![](https://avatars.dicebear.com/api/identicon/alesapin.svg?size=40) |[alesapin](https://github.com/alesapin)           | ▇▇▇               | 288
|![](https://avatars.githubusercontent.com/u/22777892?v=4&s=40) |[danhermann](https://github.com/danhermann)         | ▇▇▇               | 283


## OSS Database repos with the highest growth YoY

```sql
  SELECT db.name,
         sum(event_year = 2020) AS stars2020,
         sum(event_year = 2021) AS stars2021,
         round(sum(event_year = 2021) / sum(event_year = 2020), 3) AS yoy
    FROM github_events
         JOIN db_repos as db on db.id = github_events.repo_id
   WHERE type = 'WatchEvent' AND event_year in (2021, 2020)
GROUP BY db.name
  HAVING stars2020 > 0 and yoy > 1
ORDER BY yoy DESC
   LIMIT 20
```

```
+------------------------+-----------+-----------+-------+
| name                   | stars2021 | stars2020 | yoy   |
+------------------------+-----------+-----------+-------+
| questdb/questdb        | 5505      | 2006      | 2.744 |
| apache/incubator-doris | 1713      | 760       | 2.254 |
| trinodb/trino          | 2620      | 1227      | 2.135 |
| apache/pinot           | 895       | 461       | 1.941 |
| citusdata/citus        | 1114      | 627       | 1.777 |
| clickhouse/clickhouse  | 7628      | 5139      | 1.484 |
| crate/crate            | 422       | 300       | 1.407 |
| cockroachdb/cockroach  | 3311      | 2425      | 1.365 |
| apple/foundationdb     | 869       | 712       | 1.221 |
| facebook/rocksdb       | 3190      | 3116      | 1.024 |
| dgraph-io/dgraph       | 2814      | 2801      | 1.005 |
+------------------------+-----------+-----------+-------+

```

## OSS Database repos with lowest growth YoY

```sql
  SELECT db.name,
         sum(event_year = 2020) AS stars2020,
         sum(event_year = 2021) AS stars2021,
         round(sum(event_year = 2021) / sum(event_year = 2020), 3) AS yoy
    FROM github_events
         JOIN db_repos as db on db.id = github_events.repo_id
   WHERE type = 'WatchEvent' AND event_year in (2021, 2020)
GROUP BY db.name
  HAVING stars2020 > 0 and yoy < 1
ORDER BY yoy ASC
   LIMIT 10
```

```
+----------------------------+-----------+-----------+-------+
| name                       | stars2020 | stars2021 | yoy   |
+----------------------------+-----------+-----------+-------+
| vesoft-inc/nebula          | 4634      | 1577      | 0.340 |
| MaterializeInc/materialize | 2152      | 1227      | 0.570 |
| apache/ignite              | 740       | 500       | 0.676 |
| arangodb/arangodb          | 1860      | 1305      | 0.702 |
| percona/percona-server     | 135       | 95        | 0.704 |
| apache/druid               | 1585      | 1122      | 0.708 |
| elastic/elasticsearch      | 7852      | 5669      | 0.722 |
| apache/kylin               | 477       | 354       | 0.742 |
| taosdata/TDengine          | 4058      | 3011      | 0.742 |
| confluentinc/ksql          | 954       | 727       | 0.762 |
+----------------------------+-----------+-----------+-------+
```

## Top Language for OSS Databases

```sql
  SELECT language, count(*)
    FROM github_events
         JOIN db_repos db ON db.id = github_events.repo_id
   WHERE event_year = 2021 AND type = 'PullRequestEvent' AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 5
```


|    Logo     | language | bar                                 | count(*)
| -------- | -------- | ----------------------------------- | --------
|![](/img/lang/java.png) | Java     | ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ | 24137
|![](/img/lang/go.png) | Go       | ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇            | 16630
|![](/img/lang/cpp.png) | C++      | ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇            | 16607
|![](/img/lang/c.png) | C        | ▇▇▇▇▇▇▇▇▇▇▇                         | 7605
|![](/img/lang/rust.png) | Rust     | ▇▇▇▇▇▇                              | 4366


## Top companies contributing to OSS databases

```sql
  SELECT trim(lower(replace(u.company, '@', ''))) AS company, 
         count(distinct actor_id) AS users_count
    FROM github_events
         JOIN db_repos db ON db.id = github_events.repo_id
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
+----------------+-------------+
| company        | users_count |
+----------------+-------------+
| elastic        | 207         |
| pingcap        | 67          |
| microsoft      | 51          |
| alibaba        | 46          |
| red hat        | 45          |
| facebook       | 40          |
| google         | 38          |
| cloudera       | 37          |
| databricks     | 35          |
| linkedin       | 32          |
| vmware         | 31          |
| tencent        | 30          |
| influxdata     | 29          |
| cockroach labs | 25          |
| scylladb       | 25          |
| ibm            | 23          |
| yugabyte       | 22          |
| pivotal        | 21          |
| confluent      | 17          |
| shopify        | 17          |
+----------------+-------------+
```

## Top countries contributing to OSS databases

```sql
  SELECT country_code, 
         count(distinct actor_id) AS users_count
    FROM github_events
         JOIN db_repos db ON db.id = github_events.repo_id
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
| US           | 1583        |
| CN           | 1274        |
| DE           | 442         |
| IN           | 409         |
| GB           | 298         |
| RU           | 285         |
| FR           | 254         |
| CA           | 202         |
| NL           | 114         |
| PL           | 98          |
+--------------+-------------+
```

## OSS Database ranking

The previous analysis is for a single dimension. Let’s analyze the comprehensive measurement. The open source database community is comprehensively scored through the three metrics: stars, PRs and contributors. We can use the [Z-score](https://en.wikipedia.org/wiki/Standard_score) method to score the repo.

```sql
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
```
This is the comprehensive ranking calculated by z-score:
```
+----------------------------+---------+--------------+--------------+------------+
| name                       | z_score | z_score_star | z_score_user | z_score_pr |
+----------------------------+---------+--------------+--------------+------------+
| clickhouse/clickhouse      | 10.26   |  2.99        |  3.75        |  3.52      |
| elastic/elasticsearch      |  9.11   |  1.92        |  3.34        |  3.84      |
| cockroachdb/cockroach      |  3.72   |  0.64        |  0.67        |  2.42      |
| redis/redis                |  3.1    |  2.28        |  1.14        | -0.31      |
| pingcap/tidb               |  3.04   |  1.0         |  0.7         |  1.34      |
| prometheus/prometheus      |  2.82   |  2.05        |  1.12        | -0.35      |
| apache/spark               |  2.43   |  0.93        |  0.64        |  0.87      |
| apache/flink               |  1.65   |  0.46        |  0.49        |  0.7       |
| taosdata/TDengine          |  1.65   |  0.48        |  0.38        |  0.8       |
| influxdata/influxdb        |  1.54   |  0.25        |  1.59        | -0.3       |
| trinodb/trino              |  1.37   |  0.26        |  0.85        |  0.26      |
| etcd-io/etcd               |  1.24   |  1.3         |  0.5         | -0.56      |
| questdb/questdb            |  0.81   |  1.84        | -0.49        | -0.54      |
| facebook/rocksdb           |  0.12   |  0.58        | -0.12        | -0.34      |
| timescale/timescaledb      | -0.17   |  0.01        |  0.37        | -0.55      |
| prestodb/presto            | -0.44   | -0.3         |  0.21        | -0.35      |
| tikv/tikv                  | -0.45   | -0.08        | -0.26        | -0.12      |
| apache/incubator-doris     | -0.53   | -0.23        | -0.03        | -0.27      |
| MaterializeInc/materialize | -0.63   | -0.49        | -0.64        |  0.5       |
| vitessio/vitess            | -0.7    | -0.07        | -0.46        | -0.17      |
| apache/druid               | -0.75   | -0.55        |  0.19        | -0.39      |
| arangodb/arangodb          | -0.76   | -0.45        | -0.28        | -0.04      |
| dgraph-io/dgraph           | -0.82   |  0.37        | -0.77        | -0.42      |
| yugabyte/yugabyte-db       | -1.01   | -0.5         | -0.05        | -0.47      |
| StarRocks/starrocks        | -1.03   | -0.27        | -0.63        | -0.14      |
| apache/hadoop              | -1.08   | -0.5         | -0.3         | -0.28      |
| confluentinc/ksql          | -1.19   | -0.77        | -0.18        | -0.24      |
| apple/foundationdb         | -1.43   | -0.69        | -0.64        | -0.1       |
| apache/pinot               | -1.47   | -0.67        | -0.43        | -0.37      |
| greenplum-db/gpdb          | -1.49   | -0.82        | -0.43        | -0.23      |
| vesoft-inc/nebula          | -1.51   | -0.3         | -0.61        | -0.59      |
| mongodb/mongo              | -1.53   |  0.07        | -0.84        | -0.75      |
| scylladb/scylla            | -1.58   | -0.65        | -0.47        | -0.46      |
| apache/hive                | -1.73   | -0.84        | -0.55        | -0.34      |
| citusdata/citus            | -1.81   | -0.56        | -0.75        | -0.5       |
| apache/hbase               | -1.88   | -0.88        | -0.67        | -0.32      |
| apache/ignite              | -1.94   | -0.89        | -0.71        | -0.35      |
| crate/crate                | -2.2    | -0.93        | -0.83        | -0.44      |
| apache/couchdb             | -2.21   | -0.92        | -0.63        | -0.66      |
| MariaDB/server             | -2.26   | -0.89        | -0.7         | -0.67      |
| apache/lucene-solr         | -2.29   | -0.97        | -0.74        | -0.58      |
| apache/kylin               | -2.52   | -0.97        | -0.89        | -0.67      |
| percona/percona-server     | -2.62   | -1.11        | -0.9         | -0.61      |
| alibaba/oceanbase          | -2.84   | -1.08        | -0.99        | -0.77      |
+----------------------------+---------+--------------+--------------+------------+
```
