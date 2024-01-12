WITH tmp AS (
  SELECT
    event_year,
    db.name AS repo_name,
    COUNT(*) AS year_stars
  FROM github_events 
       JOIN db_repos db ON db.id = github_events.repo_id
  WHERE type = 'WatchEvent' AND db.name in (
    'clickhouse/clickhouse', 
    'redis/redis',
    'prometheus/prometheus',
    'elastic/elasticsearch',
    'questdb/questdb',
    'etcd-io/etcd',
    'pingcap/tidb',
    'apache/spark',
    'cockroachdb/cockroach',
    'facebook/rocksdb'
  ) 
  GROUP BY 2, 1
  ORDER BY 1 ASC, 2
), tmp1 AS (
  SELECT event_year,
         repo_name, 
         SUM(year_stars) OVER(partition by repo_name order by event_year ASC) as stars
         
  FROM tmp
  ORDER BY event_year ASC, repo_name 
)

SELECT event_year, repo_name, stars FROM tmp1 
