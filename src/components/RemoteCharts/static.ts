import {query, registerStaticData} from "./hook";

registerStaticData(query('archive-2021-archive-ranking', params => params?.repo === 'db_repos'), {
  expiresAt: "2099-12-31T00:00:00.000+08:00",
  params: {repo: "db_repos"},
  requestedAt: "2022-03-14T12:39:54.417+08:00",
  spent: 54.503,
  sql: "WITH stars AS (\n    SELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n        db.name AS repo_name,\n        COUNT(*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' WatchEvent \'\' AND event_year = 2021\nGROUP BY 1\n    ),\n    prs AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' PullRequestEvent \'\' AND event_year = 2021 AND ACTION = \'\' opened \'\'\nGROUP BY 1\n    ),\n    contributors AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (DISTINCT actor_id) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE IN (\n    \'\' IssuesEvent \'\'\n    , \'\' PullRequestEvent \'\'\n    , \'\' IssueCommentEvent \'\'\n    , \'\' PullRequestReviewCommentEvent \'\'\n    , \'\' CommitCommentEvent \'\'\n    , \'\' PullRequestReviewEvent \'\')\n  AND event_year = 2021\nGROUP BY 1\n    ),\n    raw AS (\nSELECT\n    NAME,\n    stars.count AS star_count,\n    prs.count AS pr_count,\n    contributors.count AS user_count\nFROM db_repos\n    LEFT JOIN stars\nON stars.repo_name = NAME\n    LEFT JOIN prs ON prs.repo_name = NAME\n    LEFT JOIN contributors ON contributors.repo_name = NAME\n    ),\n\n    zz_pr AS (\nSELECT AVG (pr_count) AS mean, STDDEV(pr_count) AS sd\nFROM raw\n    ),\n    zz_star AS (\nSELECT AVG (star_count) AS mean, STDDEV(star_count) AS sd\nFROM raw\n    ),\n    zz_user AS (\nSELECT AVG (user_count) AS mean, STDDEV(user_count) AS sd\nFROM raw\n    )\n\nSELECT name,\n       ((star_count - zz_star.mean) / zz_star.sd) +\n       ((user_count - zz_user.mean) / zz_user.sd) +\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score,\n       ((star_count - zz_star.mean) / zz_star.sd) AS z_score_star,\n       ((user_count - zz_user.mean) / zz_user.sd) AS z_score_user,\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score_pr\nFROM raw,\n     zz_star,\n     zz_user,\n     zz_pr\nORDER BY 2 DESC",
  data: [
  {
    "name": "clickhouse/clickhouse",
    "z_score": 10.263144812904924,
    "z_score_star": 2.9917871906435045,
    "z_score_user": 3.755333625921093,
    "z_score_pr": 3.516023996340327
  },
  {
    "name": "elastic/elasticsearch",
    "z_score": 9.112707806664696,
    "z_score_star": 1.92516207346117,
    "z_score_user": 3.342728299950072,
    "z_score_pr": 3.844817433253455
  },
  {
    "name": "cockroachdb/cockroach",
    "z_score": 3.7242526681051205,
    "z_score_star": 0.6412917180165832,
    "z_score_user": 0.6670452769864834,
    "z_score_pr": 2.4159156731020537
  },
  {
    "name": "redis/redis",
    "z_score": 3.1039709237736695,
    "z_score_star": 2.2758035106563836,
    "z_score_user": 1.1421665614379617,
    "z_score_pr": -0.31399914832067555
  },
  {
    "name": "pingcap/tidb",
    "z_score": 3.036448903293527,
    "z_score_star": 0.9979223723067463,
    "z_score_user": 0.6970529370571031,
    "z_score_pr": 1.3414735939296778
  },
  {
    "name": "prometheus/prometheus",
    "z_score": 2.8219786746333426,
    "z_score_star": 2.0503911581737464,
    "z_score_user": 1.119660816384997,
    "z_score_pr": -0.3480732999254008
  },
  {
    "name": "apache/spark",
    "z_score": 2.4332072694601092,
    "z_score_star": 0.9249628186046366,
    "z_score_user": 0.6420388935943003,
    "z_score_pr": 0.8662055572611723
  },
  {
    "name": "taosdata/TDengine",
    "z_score": 1.65433706954895,
    "z_score_star": 0.47740495932751603,
    "z_score_user": 0.3819725063155964,
    "z_score_pr": 0.7949596039058376
  },
  {
    "name": "apache/flink",
    "z_score": 1.6523118095401432,
    "z_score_star": 0.45562598807315496,
    "z_score_user": 0.49200059324120193,
    "z_score_pr": 0.7046852282257863
  },
  {
    "name": "influxdata/influxdb",
    "z_score": 1.5389214443458066,
    "z_score_star": 0.2509036582821606,
    "z_score_user": 1.592281462497257,
    "z_score_pr": -0.3042636764336112
  },
  {
    "name": "trinodb/trino",
    "z_score": 1.3724429671918716,
    "z_score_star": 0.26451551531613626,
    "z_score_user": 0.8470912374102015,
    "z_score_pr": 0.2608362144655338
  },
  {
    "name": "etcd-io/etcd",
    "z_score": 1.240655981088825,
    "z_score_star": 1.3011945470237247,
    "z_score_user": 0.49950250825885684,
    "z_score_pr": -0.5600410741937567
  },
  {
    "name": "questdb/questdb",
    "z_score": 0.8134299037182667,
    "z_score_star": 1.8353238170369306,
    "z_score_user": -0.4857489973931562,
    "z_score_pr": -0.5361449159255077
  },
  {
    "name": "facebook/rocksdb",
    "z_score": 0.12425918570164102,
    "z_score_star": 0.5748658556907819,
    "z_score_user": -0.1131538848496284,
    "z_score_pr": -0.33745278513951243
  },
  {
    "name": "timescale/timescaledb",
    "z_score": -0.17240976287000526,
    "z_score_star": 0.009157077358752397,
    "z_score_user": 0.36696867628028657,
    "z_score_pr": -0.5485355165090442
  },
  {
    "name": "prestodb/presto",
    "z_score": -0.441573477707785,
    "z_score_star": -0.30337116014132937,
    "z_score_user": 0.20942846090953324,
    "z_score_pr": -0.34763077847598883
  },
  {
    "name": "tikv/tikv",
    "z_score": -0.4550641480232816,
    "z_score_star": -0.08068117906548714,
    "z_score_user": -0.2581909085242902,
    "z_score_pr": -0.1161920604335042
  },
  {
    "name": "apache/incubator-doris",
    "z_score": -0.5300114616259075,
    "z_score_star": -0.22932265787650163,
    "z_score_user": -0.025631542976987647,
    "z_score_pr": -0.27505726077241816
  },
  {
    "name": "MaterializeInc/materialize",
    "z_score": -0.6283426516777839,
    "z_score_star": -0.49339268433562994,
    "z_score_user": -0.6382879360854729,
    "z_score_pr": 0.5033379687433188
  },
  {
    "name": "vitessio/vitess",
    "z_score": -0.7020772038566515,
    "z_score_star": -0.07305853912646076,
    "z_score_user": -0.45574133732253647,
    "z_score_pr": -0.17327732740765434
  },
  {
    "name": "apache/druid",
    "z_score": -0.7498928150508899,
    "z_score_star": -0.5511069581596868,
    "z_score_user": 0.19442463087422338,
    "z_score_pr": -0.3932104877654265
  },
  {
    "name": "arangodb/arangodb",
    "z_score": -0.7637017411091445,
    "z_score_star": -0.45146816467098483,
    "z_score_user": -0.27569537689881835,
    "z_score_pr": -0.03653819953934126
  },
  {
    "name": "dgraph-io/dgraph",
    "z_score": -0.8186699310967551,
    "z_score_star": 0.3701435258997876,
    "z_score_user": -0.7708217680640432,
    "z_score_pr": -0.41799168893249944
  },
  {
    "name": "yugabyte/yugabyte-db",
    "z_score": -1.0127765480518525,
    "z_score_star": -0.5004708499932973,
    "z_score_user": -0.0456366496907341,
    "z_score_pr": -0.4666690483678212
  },
  {
    "name": "StarRocks/starrocks",
    "z_score": -1.0284757948408598,
    "z_score_star": -0.2652579604461974,
    "z_score_user": -0.6257847443893814,
    "z_score_pr": -0.137433090005281
  },
  {
    "name": "apache/hadoop",
    "z_score": -1.081301512664143,
    "z_score_star": -0.5015597985560153,
    "z_score_user": -0.30070176029100143,
    "z_score_pr": -0.27903995381712626
  },
  {
    "name": "confluentinc/ksql",
    "z_score": -1.185668458750965,
    "z_score_star": -0.7656298250151438,
    "z_score_user": -0.17817048166930438,
    "z_score_pr": -0.2418681520665169
  },
  {
    "name": "apple/foundationdb",
    "z_score": -1.4341795381597502,
    "z_score_star": -0.6888589513435208,
    "z_score_user": -0.6432892127639095,
    "z_score_pr": -0.10203137405231968
  },
  {
    "name": "apache/pinot",
    "z_score": -1.4681666192398435,
    "z_score_star": -0.6741581457468271,
    "z_score_user": -0.4282343155911351,
    "z_score_pr": -0.3657741579018815
  },
  {
    "name": "greenplum-db/gpdb",
    "z_score": -1.4862295603526894,
    "z_score_star": -0.8249775216832778,
    "z_score_user": -0.4282343155911351,
    "z_score_pr": -0.23301772307827656
  },
  {
    "name": "vesoft-inc/nebula",
    "z_score": -1.508112809936629,
    "z_score_star": -0.30337116014132937,
    "z_score_user": -0.6132815526932899,
    "z_score_pr": -0.5914600971020099
  },
  {
    "name": "mongodb/mongo",
    "z_score": -1.5274753633944185,
    "z_score_star": 0.06796029974552736,
    "z_score_user": -0.8433402799013741,
    "z_score_pr": -0.7520953832385718
  },
  {
    "name": "scylladb/scylla",
    "z_score": -1.579088750003981,
    "z_score_star": -0.6534681230551841,
    "z_score_user": -0.468244529018628,
    "z_score_pr": -0.45737609793016887
  },
  {
    "name": "apache/hive",
    "z_score": -1.7312339172494597,
    "z_score_star": -0.8440341215308437,
    "z_score_user": -0.5457643175343956,
    "z_score_pr": -0.3414354781842206
  },
  {
    "name": "citusdata/citus",
    "z_score": -1.805305065461061,
    "z_score_star": -0.5549182781292,
    "z_score_user": -0.7483160230110785,
    "z_score_pr": -0.5020707643207825
  },
  {
    "name": "apache/hbase",
    "z_score": -1.8755545172446846,
    "z_score_star": -0.8832362697886936,
    "z_score_user": -0.6707962344953109,
    "z_score_pr": -0.32152201296067984
  },
  {
    "name": "apache/ignite",
    "z_score": -1.943936463426928,
    "z_score_star": -0.889769961165002,
    "z_score_user": -0.7083058095835855,
    "z_score_pr": -0.34586069267834074
  },
  {
    "name": "crate/crate",
    "z_score": -2.202751283269977,
    "z_score_star": -0.9322389551110062,
    "z_score_user": -0.8308370882052826,
    "z_score_pr": -0.43967523995368823
  },
  {
    "name": "apache/couchdb",
    "z_score": -2.2140237408204873,
    "z_score_star": -0.9240718408906208,
    "z_score_user": -0.630786021067818,
    "z_score_pr": -0.6591658788620484
  },
  {
    "name": "MariaDB/server",
    "z_score": -2.262386778365718,
    "z_score_star": -0.890314435446361,
    "z_score_user": -0.6983032562267123,
    "z_score_pr": -0.6737690866926449
  },
  {
    "name": "apache/lucene-solr",
    "z_score": -2.292754225060936,
    "z_score_star": -0.9719855776502151,
    "z_score_user": -0.7408141079934235,
    "z_score_pr": -0.5799545394172974
  },
  {
    "name": "apache/kylin",
    "z_score": -2.523861198303364,
    "z_score_star": -0.96926320624342,
    "z_score_user": -0.8883517700073036,
    "z_score_pr": -0.6662462220526406
  },
  {
    "name": "percona/percona-server",
    "z_score": -2.625011207483572,
    "z_score_star": -1.110282045115408,
    "z_score_user": -0.9033556000426135,
    "z_score_pr": -0.6113735623255505
  },
  {
    "name": "alibaba/oceanbase",
    "z_score": -2.842032793309105,
    "z_score_star": -1.0841472796101748,
    "z_score_user": -0.9858766652368176,
    "z_score_pr": -0.7720088484621125
  }
]})