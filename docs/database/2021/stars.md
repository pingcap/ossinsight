---
title: Top 10 repos in the database field with stars growth in 2021
---

```sql
SELECT /*+ read_from_storage(tiflash[github_events]) */
  db_repos.name AS repo_name,
  COUNT(*) AS num
FROM github_events 
JOIN db_repos ON db_repos.id = github_events.repo_id
WHERE type = 'WatchEvent' AND event_year = 2021
GROUP BY db_repos.name
ORDER BY 2 desc
LIMIT 10
```
<iframe src="https://staticsiteg.github.io/echarts/simple.html?x=[%22clickhouse/clickhouse%22,%22redis/redis%22,%22prometheus/prometheus%22,%22elastic/elasticsearch%22,%22questdb/questdb%22,%22etcd-io/etcd%22,%22pingcap/tidb%22,%22apache/spark%22,%22cockroachdb/cockroach%22,%22facebook/rocksdb%22]&data=[7628,6313,5898,5669,5505,4524,3967,3833,3311,3190]&theme=dark"  width="100%" height="400" scrolling="no" frameborder="0"></iframe>


```
+-----------------------+------+
| repo_name             | num  |
+-----------------------+------+
| clickhouse/clickhouse | 7628 |
| redis/redis           | 6313 |
| prometheus/prometheus | 5898 |
| elastic/elasticsearch | 5669 |
| questdb/questdb       | 5505 |
| etcd-io/etcd          | 4524 |
| pingcap/tidb          | 3967 |
| apache/spark          | 3833 |
| cockroachdb/cockroach | 3311 |
| facebook/rocksdb      | 3190 |
+-----------------------+------+
```

```
clickhouse/clickhouse : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 7628
          redis/redis : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 6313
prometheus/prometheus : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 5898
elastic/elasticsearch : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 5669
      questdb/questdb : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 5505
         etcd-io/etcd : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 4524
         pingcap/tidb : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 3967
         apache/spark : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 3833
cockroachdb/cockroach : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 3311
     facebook/rocksdb : ▇▇▇▇▇▇▇▇▇▇▇▇ 3190
```