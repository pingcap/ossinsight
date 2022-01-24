---
title: Top 10 repos in the database field with contributors growth in 2021
---

```sql
SELECT /*+ read_from_storage(tiflash[github_events]) */ 
  db_repos.name as repo_name,
  COUNT(distinct actor_id) AS num
FROM github_events 
JOIN db_repos ON db_repos.id = github_events.repo_id
WHERE type = 'PullRequestEvent' AND event_year = 2021 AND action = 'opened'
GROUP BY 1
ORDER BY 2 desc
LIMIT 10
```

```text
+------------------------+-----+
| repo_name              | num |
+------------------------+-----+
| apache/spark           | 441 |
| clickhouse/clickhouse  | 414 |
| elastic/elasticsearch  | 352 |
| pingcap/tidb           | 307 |
| cockroachdb/cockroach  | 252 |
| trinodb/trino          | 224 |
| prometheus/prometheus  | 210 |
| redis/redis            | 179 |
| prestodb/presto        | 173 |
| apache/incubator-doris | 149 |
+------------------------+-----+
```

```
clickhouse/clickhouse : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 7628
redis/redis : ▇▇▇▇▇▇▇▇▇▇▇▇▇ 6313
prometheus/prometheus : ▇▇▇▇▇▇▇▇▇▇▇▇ 5898
elastic/elasticsearch : ▇▇▇▇▇▇▇▇▇▇▇ 5669
questdb/questdb : ▇▇▇▇▇▇▇▇▇▇▇ 5505
etcd-io/etcd : ▇▇▇▇▇▇▇▇▇ 4524
pingcap/tidb : ▇▇▇▇▇▇▇▇ 3967
apache/spark : ▇▇▇▇▇▇▇▇ 3833
cockroachdb/cockroach : ▇▇▇▇▇▇▇ 3311
facebook/rocksdb : ▇▇▇▇▇▇ 3190
```