import { AxiosRequestConfig } from 'axios';
import { registerStaticData } from './client';

export const query = (query: string, validateParams: (check: AxiosRequestConfig['params']) => boolean) => {
  return (config) => {
    if (config.url !== `/q/${query}`) {
      return false;
    } else {
      return validateParams(config.params);
    }
  };
};

registerStaticData(query('archive-2021-archive-ranking', params => params?.repo === 'db_repos'), {
  expiresAt: '2099-12-31T00:00:00.000+08:00',
  params: { repo: 'db_repos' },
  requestedAt: '2022-03-14T12:39:54.417+08:00',
  spent: 54.503,
  sql: "WITH stars AS (\n    SELECT \n        db.name AS repo_name,\n        COUNT(*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' WatchEvent \'\' AND event_year = 2021\nGROUP BY 1\n    ),\n    prs AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' PullRequestEvent \'\' AND event_year = 2021 AND ACTION = \'\' opened \'\'\nGROUP BY 1\n    ),\n    contributors AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (DISTINCT actor_id) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE IN (\n    \'\' IssuesEvent \'\'\n    , \'\' PullRequestEvent \'\'\n    , \'\' IssueCommentEvent \'\'\n    , \'\' PullRequestReviewCommentEvent \'\'\n    , \'\' CommitCommentEvent \'\'\n    , \'\' PullRequestReviewEvent \'\')\n  AND event_year = 2021\nGROUP BY 1\n    ),\n    raw AS (\nSELECT\n    NAME,\n    stars.count AS star_count,\n    prs.count AS pr_count,\n    contributors.count AS user_count\nFROM db_repos\n    LEFT JOIN stars\nON stars.repo_name = NAME\n    LEFT JOIN prs ON prs.repo_name = NAME\n    LEFT JOIN contributors ON contributors.repo_name = NAME\n    ),\n\n    zz_pr AS (\nSELECT AVG (pr_count) AS mean, STDDEV(pr_count) AS sd\nFROM raw\n    ),\n    zz_star AS (\nSELECT AVG (star_count) AS mean, STDDEV(star_count) AS sd\nFROM raw\n    ),\n    zz_user AS (\nSELECT AVG (user_count) AS mean, STDDEV(user_count) AS sd\nFROM raw\n    )\n\nSELECT name,\n       ((star_count - zz_star.mean) / zz_star.sd) +\n       ((user_count - zz_user.mean) / zz_user.sd) +\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score,\n       ((star_count - zz_star.mean) / zz_star.sd) AS z_score_star,\n       ((user_count - zz_user.mean) / zz_user.sd) AS z_score_user,\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score_pr\nFROM raw,\n     zz_star,\n     zz_user,\n     zz_pr\nORDER BY 2 DESC",
  data: [
    {
      name: 'clickhouse/clickhouse',
      z_score: 10.263144812904924,
      z_score_star: 2.9917871906435045,
      z_score_user: 3.755333625921093,
      z_score_pr: 3.516023996340327
    },
    {
      name: 'elastic/elasticsearch',
      z_score: 9.112707806664696,
      z_score_star: 1.92516207346117,
      z_score_user: 3.342728299950072,
      z_score_pr: 3.844817433253455
    },
    {
      name: 'cockroachdb/cockroach',
      z_score: 3.7242526681051205,
      z_score_star: 0.6412917180165832,
      z_score_user: 0.6670452769864834,
      z_score_pr: 2.4159156731020537
    },
    {
      name: 'redis/redis',
      z_score: 3.1039709237736695,
      z_score_star: 2.2758035106563836,
      z_score_user: 1.1421665614379617,
      z_score_pr: -0.31399914832067555
    },
    {
      name: 'pingcap/tidb',
      z_score: 3.036448903293527,
      z_score_star: 0.9979223723067463,
      z_score_user: 0.6970529370571031,
      z_score_pr: 1.3414735939296778
    },
    {
      name: 'prometheus/prometheus',
      z_score: 2.8219786746333426,
      z_score_star: 2.0503911581737464,
      z_score_user: 1.119660816384997,
      z_score_pr: -0.3480732999254008
    },
    {
      name: 'apache/spark',
      z_score: 2.4332072694601092,
      z_score_star: 0.9249628186046366,
      z_score_user: 0.6420388935943003,
      z_score_pr: 0.8662055572611723
    },
    {
      name: 'taosdata/TDengine',
      z_score: 1.65433706954895,
      z_score_star: 0.47740495932751603,
      z_score_user: 0.3819725063155964,
      z_score_pr: 0.7949596039058376
    },
    {
      name: 'apache/flink',
      z_score: 1.6523118095401432,
      z_score_star: 0.45562598807315496,
      z_score_user: 0.49200059324120193,
      z_score_pr: 0.7046852282257863
    },
    {
      name: 'influxdata/influxdb',
      z_score: 1.5389214443458066,
      z_score_star: 0.2509036582821606,
      z_score_user: 1.592281462497257,
      z_score_pr: -0.3042636764336112
    },
    {
      name: 'trinodb/trino',
      z_score: 1.3724429671918716,
      z_score_star: 0.26451551531613626,
      z_score_user: 0.8470912374102015,
      z_score_pr: 0.2608362144655338
    },
    {
      name: 'etcd-io/etcd',
      z_score: 1.240655981088825,
      z_score_star: 1.3011945470237247,
      z_score_user: 0.49950250825885684,
      z_score_pr: -0.5600410741937567
    },
    {
      name: 'questdb/questdb',
      z_score: 0.8134299037182667,
      z_score_star: 1.8353238170369306,
      z_score_user: -0.4857489973931562,
      z_score_pr: -0.5361449159255077
    },
    {
      name: 'facebook/rocksdb',
      z_score: 0.12425918570164102,
      z_score_star: 0.5748658556907819,
      z_score_user: -0.1131538848496284,
      z_score_pr: -0.33745278513951243
    },
    {
      name: 'timescale/timescaledb',
      z_score: -0.17240976287000526,
      z_score_star: 0.009157077358752397,
      z_score_user: 0.36696867628028657,
      z_score_pr: -0.5485355165090442
    },
    {
      name: 'prestodb/presto',
      z_score: -0.441573477707785,
      z_score_star: -0.30337116014132937,
      z_score_user: 0.20942846090953324,
      z_score_pr: -0.34763077847598883
    },
    {
      name: 'tikv/tikv',
      z_score: -0.4550641480232816,
      z_score_star: -0.08068117906548714,
      z_score_user: -0.2581909085242902,
      z_score_pr: -0.1161920604335042
    },
    {
      name: 'apache/incubator-doris',
      z_score: -0.5300114616259075,
      z_score_star: -0.22932265787650163,
      z_score_user: -0.025631542976987647,
      z_score_pr: -0.27505726077241816
    },
    {
      name: 'MaterializeInc/materialize',
      z_score: -0.6283426516777839,
      z_score_star: -0.49339268433562994,
      z_score_user: -0.6382879360854729,
      z_score_pr: 0.5033379687433188
    },
    {
      name: 'vitessio/vitess',
      z_score: -0.7020772038566515,
      z_score_star: -0.07305853912646076,
      z_score_user: -0.45574133732253647,
      z_score_pr: -0.17327732740765434
    },
    {
      name: 'apache/druid',
      z_score: -0.7498928150508899,
      z_score_star: -0.5511069581596868,
      z_score_user: 0.19442463087422338,
      z_score_pr: -0.3932104877654265
    },
    {
      name: 'arangodb/arangodb',
      z_score: -0.7637017411091445,
      z_score_star: -0.45146816467098483,
      z_score_user: -0.27569537689881835,
      z_score_pr: -0.03653819953934126
    },
    {
      name: 'dgraph-io/dgraph',
      z_score: -0.8186699310967551,
      z_score_star: 0.3701435258997876,
      z_score_user: -0.7708217680640432,
      z_score_pr: -0.41799168893249944
    },
    {
      name: 'yugabyte/yugabyte-db',
      z_score: -1.0127765480518525,
      z_score_star: -0.5004708499932973,
      z_score_user: -0.0456366496907341,
      z_score_pr: -0.4666690483678212
    },
    {
      name: 'StarRocks/starrocks',
      z_score: -1.0284757948408598,
      z_score_star: -0.2652579604461974,
      z_score_user: -0.6257847443893814,
      z_score_pr: -0.137433090005281
    },
    {
      name: 'apache/hadoop',
      z_score: -1.081301512664143,
      z_score_star: -0.5015597985560153,
      z_score_user: -0.30070176029100143,
      z_score_pr: -0.27903995381712626
    },
    {
      name: 'confluentinc/ksql',
      z_score: -1.185668458750965,
      z_score_star: -0.7656298250151438,
      z_score_user: -0.17817048166930438,
      z_score_pr: -0.2418681520665169
    },
    {
      name: 'apple/foundationdb',
      z_score: -1.4341795381597502,
      z_score_star: -0.6888589513435208,
      z_score_user: -0.6432892127639095,
      z_score_pr: -0.10203137405231968
    },
    {
      name: 'apache/pinot',
      z_score: -1.4681666192398435,
      z_score_star: -0.6741581457468271,
      z_score_user: -0.4282343155911351,
      z_score_pr: -0.3657741579018815
    },
    {
      name: 'greenplum-db/gpdb',
      z_score: -1.4862295603526894,
      z_score_star: -0.8249775216832778,
      z_score_user: -0.4282343155911351,
      z_score_pr: -0.23301772307827656
    },
    {
      name: 'vesoft-inc/nebula',
      z_score: -1.508112809936629,
      z_score_star: -0.30337116014132937,
      z_score_user: -0.6132815526932899,
      z_score_pr: -0.5914600971020099
    },
    {
      name: 'mongodb/mongo',
      z_score: -1.5274753633944185,
      z_score_star: 0.06796029974552736,
      z_score_user: -0.8433402799013741,
      z_score_pr: -0.7520953832385718
    },
    {
      name: 'scylladb/scylla',
      z_score: -1.579088750003981,
      z_score_star: -0.6534681230551841,
      z_score_user: -0.468244529018628,
      z_score_pr: -0.45737609793016887
    },
    {
      name: 'apache/hive',
      z_score: -1.7312339172494597,
      z_score_star: -0.8440341215308437,
      z_score_user: -0.5457643175343956,
      z_score_pr: -0.3414354781842206
    },
    {
      name: 'citusdata/citus',
      z_score: -1.805305065461061,
      z_score_star: -0.5549182781292,
      z_score_user: -0.7483160230110785,
      z_score_pr: -0.5020707643207825
    },
    {
      name: 'apache/hbase',
      z_score: -1.8755545172446846,
      z_score_star: -0.8832362697886936,
      z_score_user: -0.6707962344953109,
      z_score_pr: -0.32152201296067984
    },
    {
      name: 'apache/ignite',
      z_score: -1.943936463426928,
      z_score_star: -0.889769961165002,
      z_score_user: -0.7083058095835855,
      z_score_pr: -0.34586069267834074
    },
    {
      name: 'crate/crate',
      z_score: -2.202751283269977,
      z_score_star: -0.9322389551110062,
      z_score_user: -0.8308370882052826,
      z_score_pr: -0.43967523995368823
    },
    {
      name: 'apache/couchdb',
      z_score: -2.2140237408204873,
      z_score_star: -0.9240718408906208,
      z_score_user: -0.630786021067818,
      z_score_pr: -0.6591658788620484
    },
    {
      name: 'MariaDB/server',
      z_score: -2.262386778365718,
      z_score_star: -0.890314435446361,
      z_score_user: -0.6983032562267123,
      z_score_pr: -0.6737690866926449
    },
    {
      name: 'apache/lucene-solr',
      z_score: -2.292754225060936,
      z_score_star: -0.9719855776502151,
      z_score_user: -0.7408141079934235,
      z_score_pr: -0.5799545394172974
    },
    {
      name: 'apache/kylin',
      z_score: -2.523861198303364,
      z_score_star: -0.96926320624342,
      z_score_user: -0.8883517700073036,
      z_score_pr: -0.6662462220526406
    },
    {
      name: 'percona/percona-server',
      z_score: -2.625011207483572,
      z_score_star: -1.110282045115408,
      z_score_user: -0.9033556000426135,
      z_score_pr: -0.6113735623255505
    },
    {
      name: 'alibaba/oceanbase',
      z_score: -2.842032793309105,
      z_score_star: -1.0841472796101748,
      z_score_user: -0.9858766652368176,
      z_score_pr: -0.7720088484621125
    }
  ]
});

registerStaticData(query('archive-2021-archive-ranking', params => params?.repo === 'js_framework_repos'), {
  expiresAt: '2099-12-31T00:00:00.000+08:00',
  params: { repo: 'db_repos' },
  requestedAt: '2022-03-14T12:39:54.417+08:00',
  spent: 54.503,
  sql: "WITH stars AS (\n    SELECT \n        db.name AS repo_name,\n        COUNT(*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' WatchEvent \'\' AND event_year = 2021\nGROUP BY 1\n    ),\n    prs AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' PullRequestEvent \'\' AND event_year = 2021 AND ACTION = \'\' opened \'\'\nGROUP BY 1\n    ),\n    contributors AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (DISTINCT actor_id) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE IN (\n    \'\' IssuesEvent \'\'\n    , \'\' PullRequestEvent \'\'\n    , \'\' IssueCommentEvent \'\'\n    , \'\' PullRequestReviewCommentEvent \'\'\n    , \'\' CommitCommentEvent \'\'\n    , \'\' PullRequestReviewEvent \'\')\n  AND event_year = 2021\nGROUP BY 1\n    ),\n    raw AS (\nSELECT\n    NAME,\n    stars.count AS star_count,\n    prs.count AS pr_count,\n    contributors.count AS user_count\nFROM db_repos\n    LEFT JOIN stars\nON stars.repo_name = NAME\n    LEFT JOIN prs ON prs.repo_name = NAME\n    LEFT JOIN contributors ON contributors.repo_name = NAME\n    ),\n\n    zz_pr AS (\nSELECT AVG (pr_count) AS mean, STDDEV(pr_count) AS sd\nFROM raw\n    ),\n    zz_star AS (\nSELECT AVG (star_count) AS mean, STDDEV(star_count) AS sd\nFROM raw\n    ),\n    zz_user AS (\nSELECT AVG (user_count) AS mean, STDDEV(user_count) AS sd\nFROM raw\n    )\n\nSELECT name,\n       ((star_count - zz_star.mean) / zz_star.sd) +\n       ((user_count - zz_user.mean) / zz_user.sd) +\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score,\n       ((star_count - zz_star.mean) / zz_star.sd) AS z_score_star,\n       ((user_count - zz_user.mean) / zz_user.sd) AS z_score_user,\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score_pr\nFROM raw,\n     zz_star,\n     zz_user,\n     zz_pr\nORDER BY 2 DESC",
  data: [
    {
      name: 'angular/angular',
      z_score: 8.800007469564775,
      z_score_star: 1.2033483939479728,
      z_score_user: 3.357752839468642,
      z_score_pr: 4.2389062361481615
    },
    {
      name: 'facebook/react',
      z_score: 8.172732489605625,
      z_score_star: 3.1335999336580267,
      z_score_user: 3.0564355140334576,
      z_score_pr: 1.9826970419141414
    },
    {
      name: 'sveltejs/svelte',
      z_score: 4.210689172664328,
      z_score_star: 2.4368102345056952,
      z_score_user: 1.3705283322083055,
      z_score_pr: 0.4033506059503272
    },
    {
      name: 'vuejs/core',
      z_score: 3.5951952000337783,
      z_score_star: 0.7585228270784038,
      z_score_user: 1.4925251029942581,
      z_score_pr: 1.3441472699611168
    },
    {
      name: 'vuejs/vue',
      z_score: 2.8980616156525953,
      z_score_star: 2.3454548181224713,
      z_score_user: 0.7282079848172057,
      z_score_pr: -0.17560118728708177
    },
    {
      name: 'alpinejs/alpine',
      z_score: 0.5368100997911969,
      z_score_star: 0.5409397654774993,
      z_score_user: -0.024350408464814947,
      z_score_pr: 0.020220742778512445
    },
    {
      name: 'solidjs/solid',
      z_score: 0.22135566181729516,
      z_score_star: 0.8050191321910124,
      z_score_user: -0.24629634085853588,
      z_score_pr: -0.33736712951518133
    },
    {
      name: 'preactjs/preact',
      z_score: -0.15023176721678072,
      z_score_star: -0.11852191407738598,
      z_score_user: -0.12429957007258331,
      z_score_pr: 0.09258971693318857
    },
    {
      name: 'emberjs/ember.js',
      z_score: -0.4213246542745512,
      z_score_star: -0.49212954882024806,
      z_score_user: -0.1963217600546517,
      z_score_pr: 0.2671266546003486
    },
    {
      name: 'ionic-team/stencil',
      z_score: -0.5123614049931173,
      z_score_star: -0.39488023460584837,
      z_score_user: 0.12410349333495867,
      z_score_pr: -0.24158466372222764
    },
    {
      name: 'neomjs/neo',
      z_score: -0.700003920577231,
      z_score_star: -0.46888139626394376,
      z_score_user: -0.5152771728323832,
      z_score_pr: 0.28415464851909594
    },
    {
      name: 'jquery/jquery',
      z_score: -0.9850507374977469,
      z_score_star: -0.23951053900068792,
      z_score_user: -0.3315470963475148,
      z_score_pr: -0.41399310214954427
    },
    {
      name: 'hotwired/stimulus',
      z_score: -1.1119022752966266,
      z_score_star: -0.38227384202250025,
      z_score_user: -0.3433058212425464,
      z_score_pr: -0.38632261203157986
    },
    {
      name: 'aurelia/aurelia',
      z_score: -1.1959603021840186,
      z_score_star: -0.5700599756991273,
      z_score_user: -0.44178514223843585,
      z_score_pr: -0.18411518424645543
    },
    {
      name: 'marko-js/marko',
      z_score: -1.300362290111432,
      z_score_star: -0.43941190710806505,
      z_score_user: -0.46824227325225687,
      z_score_pr: -0.3927081097511101
    },
    {
      name: 'polymer/lit-element',
      z_score: -1.371231714833128,
      z_score_star: -0.500151798646015,
      z_score_user: -0.4123883300008569,
      z_score_pr: -0.458691586186256
    },
    {
      name: 'angular/angular.js',
      z_score: -1.393607793496476,
      z_score_star: -0.485580773452275,
      z_score_user: -0.4344359391790411,
      z_score_pr: -0.4735910808651599
    },
    {
      name: 'mithriljs/mithril.js',
      z_score: -1.4264690331951588,
      z_score_star: -0.486563089757471,
      z_score_user: -0.4535438671334674,
      z_score_pr: -0.4863620763042204
    },
    {
      name: 'jorgebucaran/hyperapp',
      z_score: -1.4334269606720695,
      z_score_star: -0.49098351313085276,
      z_score_user: -0.4858803605948042,
      z_score_pr: -0.45656308694641257
    },
    {
      name: 'tastejs/todomvc',
      z_score: -1.44948515952114,
      z_score_star: -0.471009748258535,
      z_score_user: -0.4814708387591674,
      z_score_pr: -0.49700457250343744
    },
    {
      name: 'knockout/knockout',
      z_score: -1.5369232429380901,
      z_score_star: -0.5479578588322183,
      z_score_user: -0.47706131692353054,
      z_score_pr: -0.5119040671823414
    },
    {
      name: 'Polymer/polymer',
      z_score: -1.5391570255369889,
      z_score_star: -0.5288026908808972,
      z_score_user: -0.5005787667135937,
      z_score_pr: -0.509775567942498
    },
    {
      name: 'riot/riot',
      z_score: -1.5591278927896521,
      z_score_star: -0.5366612213224647,
      z_score_user: -0.5020486073254726,
      z_score_pr: -0.520418064141715
    },
    {
      name: 'aurelia/framework',
      z_score: -1.599027888046889,
      z_score_star: -0.5617102871049616,
      z_score_user: -0.5211565352798989,
      z_score_pr: -0.5161610656620282
    },
    {
      name: 'daemonite/material',
      z_score: -1.619976112551564,
      z_score_star: -0.5882328273452525,
      z_score_user: -0.5240962165036569,
      z_score_pr: -0.5076470687026545
    },
    {
      name: 'dojo/dojo',
      z_score: -1.6249175010711245,
      z_score_star: -0.5942904445606275,
      z_score_user: -0.5123374916086253,
      z_score_pr: -0.5182895649018716
    },
    {
      name: 'optimizely/nuclear-js',
      z_score: -1.654496496412982,
      z_score_star: -0.5975648322446141,
      z_score_user: -0.5343851007868095,
      z_score_pr: -0.5225465633815585
    },
    {
      name: 'finom/seemple',
      z_score: -1.6598919683997297,
      z_score_star: -0.600020623007604,
      z_score_user: -0.5373247820105673,
      z_score_pr: -0.5225465633815585
    },
    {
      name: 'jashkenas/backbone',
      z_score: null,
      z_score_star: -0.5356789050172688,
      z_score_user: -0.5240962165036569,
      z_score_pr: null
    },
    {
      name: 'spine/spine',
      z_score: null,
      z_score_star: -0.5928169701028336,
      z_score_user: -0.5373247820105673,
      z_score_pr: null
    }
  ]
});

registerStaticData(query('archive-2021-archive-ranking', params => params?.repo === 'web_framework_repos'), {
  expiresAt: '2099-12-31T00:00:00.000+08:00',
  params: { repo: 'db_repos' },
  requestedAt: '2022-03-14T12:39:54.417+08:00',
  spent: 54.503,
  sql: "WITH stars AS (\n    SELECT \n        db.name AS repo_name,\n        COUNT(*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' WatchEvent \'\' AND event_year = 2021\nGROUP BY 1\n    ),\n    prs AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' PullRequestEvent \'\' AND event_year = 2021 AND ACTION = \'\' opened \'\'\nGROUP BY 1\n    ),\n    contributors AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (DISTINCT actor_id) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE IN (\n    \'\' IssuesEvent \'\'\n    , \'\' PullRequestEvent \'\'\n    , \'\' IssueCommentEvent \'\'\n    , \'\' PullRequestReviewCommentEvent \'\'\n    , \'\' CommitCommentEvent \'\'\n    , \'\' PullRequestReviewEvent \'\')\n  AND event_year = 2021\nGROUP BY 1\n    ),\n    raw AS (\nSELECT\n    NAME,\n    stars.count AS star_count,\n    prs.count AS pr_count,\n    contributors.count AS user_count\nFROM db_repos\n    LEFT JOIN stars\nON stars.repo_name = NAME\n    LEFT JOIN prs ON prs.repo_name = NAME\n    LEFT JOIN contributors ON contributors.repo_name = NAME\n    ),\n\n    zz_pr AS (\nSELECT AVG (pr_count) AS mean, STDDEV(pr_count) AS sd\nFROM raw\n    ),\n    zz_star AS (\nSELECT AVG (star_count) AS mean, STDDEV(star_count) AS sd\nFROM raw\n    ),\n    zz_user AS (\nSELECT AVG (user_count) AS mean, STDDEV(user_count) AS sd\nFROM raw\n    )\n\nSELECT name,\n       ((star_count - zz_star.mean) / zz_star.sd) +\n       ((user_count - zz_user.mean) / zz_user.sd) +\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score,\n       ((star_count - zz_star.mean) / zz_star.sd) AS z_score_star,\n       ((user_count - zz_user.mean) / zz_user.sd) AS z_score_user,\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score_pr\nFROM raw,\n     zz_star,\n     zz_user,\n     zz_pr\nORDER BY 2 DESC",
  data: [
    {
      name: 'dotnet/aspnetcore',
      z_score: 10.823277037152003,
      z_score_star: 1.5436467844637807,
      z_score_user: 4.779169699186927,
      z_score_pr: 4.500460553501296
    },
    {
      name: 'strapi/strapi',
      z_score: 7.050833299124113,
      z_score_star: 2.8315772471388865,
      z_score_user: 2.404460139361806,
      z_score_pr: 1.8147959126234208
    },
    {
      name: 'nestjs/nest',
      z_score: 6.071699631831411,
      z_score_star: 2.912931345273409,
      z_score_user: 1.0926358948883295,
      z_score_pr: 2.0661323916696728
    },
    {
      name: 'symfony/symfony',
      z_score: 5.892504385288719,
      z_score_star: 0.042646064769686895,
      z_score_user: 2.5191398707550094,
      z_score_pr: 3.3307184497640225
    },
    {
      name: 'rails/rails',
      z_score: 5.400849213544802,
      z_score_star: 0.3162916675858086,
      z_score_user: 2.6422108020062525,
      z_score_pr: 2.4423467439527418
    },
    {
      name: 'django/django',
      z_score: 3.902601778286489,
      z_score_star: 2.0680461443005957,
      z_score_user: 0.32484110787773396,
      z_score_pr: 1.509714526108159
    },
    {
      name: 'spring-projects/spring-boot',
      z_score: 3.6259588754082577,
      z_score_star: 1.7778479760631642,
      z_score_user: 1.6282741524931712,
      z_score_pr: 0.21983674685192253
    },
    {
      name: 'gin-gonic/gin',
      z_score: 2.9874692009358217,
      z_score_star: 3.012598920044274,
      z_score_user: 0.22134964296191598,
      z_score_pr: -0.24647936207036883
    },
    {
      name: 'spring-projects/spring-framework',
      z_score: 2.365181096894361,
      z_score_star: 1.0463654573384733,
      z_score_user: 1.2380833590943439,
      z_score_pr: 0.0807322804615441
    },
    {
      name: 'fastify/fastify',
      z_score: 1.10272322414305,
      z_score_star: 0.8938705461166191,
      z_score_user: 0.02695351291733899,
      z_score_pr: 0.18189916510909204
    },
    {
      name: 'laravel/laravel',
      z_score: 0.8190186635353058,
      z_score_star: 1.2231609433277824,
      z_score_user: -0.23037661606253276,
      z_score_pr: -0.17376566372994373
    },
    {
      name: 'pallets/flask',
      z_score: 0.7104858522599838,
      z_score_star: 0.9688853638770231,
      z_score_user: -0.147863150791813,
      z_score_pr: -0.11053636082522626
    },
    {
      name: 'expressjs/express',
      z_score: 0.2988030307598994,
      z_score_star: 0.8575957750869401,
      z_score_user: -0.09891448495325045,
      z_score_pr: -0.4598782593737903
    },
    {
      name: 'SergioBenitez/rocket',
      z_score: 0.17289865387231668,
      z_score_star: 0.5212617330156449,
      z_score_user: -0.027589286159916432,
      z_score_pr: -0.32077379298341185
    },
    {
      name: 'actix/actix-web',
      z_score: 0.053808831631642906,
      z_score_star: 0.15358347131676325,
      z_score_user: -0.11569688466932904,
      z_score_pr: 0.015922244984208692
    },
    {
      name: 'tokio-rs/axum',
      z_score: -0.23032168348514395,
      z_score_star: 0.13632654140944028,
      z_score_user: -0.3604402138621418,
      z_score_pr: -0.006208011032442423
    },
    {
      name: 'phoenixframework/phoenix',
      z_score: -0.2931943040319737,
      z_score_star: -0.25459574832787646,
      z_score_user: -0.015002486372857489,
      z_score_pr: -0.02359606933123973
    },
    {
      name: 'labstack/echo',
      z_score: -0.48542465763829923,
      z_score_star: 0.1180130647730975,
      z_score_user: -0.24156488253991848,
      z_score_pr: -0.3618728398714782
    },
    {
      name: 'beego/beego',
      z_score: -0.5088576140160819,
      z_score_star: -0.061247696917257656,
      z_score_user: -0.21219568303678094,
      z_score_pr: -0.23541423406204326
    },
    {
      name: 'cakephp/cakephp',
      z_score: -0.5485323690861819,
      z_score_star: -0.7487074352661246,
      z_score_user: -0.29470914830750067,
      z_score_pr: 0.4948842144874435
    },
    {
      name: 'valyala/fasthttp',
      z_score: -0.6245006734414909,
      z_score_star: 0.09476903673466246,
      z_score_user: -0.33526661428802396,
      z_score_pr: -0.3840030958881293
    },
    {
      name: 'gogf/gf',
      z_score: -0.6396730222913618,
      z_score_star: -0.09576155673190365,
      z_score_user: -0.20100741655939522,
      z_score_pr: -0.342904049000063
    },
    {
      name: 'adonisjs/core',
      z_score: -0.653375460347629,
      z_score_star: 0.09159939654760313,
      z_score_user: -0.24715901577861135,
      z_score_pr: -0.49781584111662075
    },
    {
      name: 'seanmonstar/warp',
      z_score: -0.7747306205471876,
      z_score_star: -0.1190055847703387,
      z_score_user: -0.2527531490173042,
      z_score_pr: -0.4029718867595446
    },
    {
      name: 'meteor/meteor',
      z_score: -0.7820979816909593,
      z_score_star: -0.49865804273144454,
      z_score_user: -0.08912475178553793,
      z_score_pr: -0.19431518717397692
    },
    {
      name: 'yiisoft/yii2',
      z_score: -0.8158133176723998,
      z_score_star: -0.6881320894689908,
      z_score_user: -0.11989248459834868,
      z_score_pr: -0.007788743605060359
    },
    {
      name: 'gorilla/mux',
      z_score: -0.8861402936549256,
      z_score_star: 0.040885153554653934,
      z_score_user: -0.41498301293939727,
      z_score_pr: -0.5120424342701823
    },
    {
      name: 'go-chi/chi',
      z_score: -0.9590307040518153,
      z_score_star: -0.11548376234027279,
      z_score_user: -0.38841088005560614,
      z_score_pr: -0.4551360616559365
    },
    {
      name: 'playframework/playframework',
      z_score: -0.9995169858360691,
      z_score_star: -0.7015150147032414,
      z_score_user: -0.31708568126227216,
      z_score_pr: 0.019083710129444566
    },
    {
      name: 'koajs/koa',
      z_score: -1.014510347228677,
      z_score_star: -0.15034980439792536,
      z_score_user: -0.41218594632005084,
      z_score_pr: -0.4519745965107006
    },
    {
      name: 'feathersjs/feathers',
      z_score: -1.2311260379763702,
      z_score_star: -0.5715597670338091,
      z_score_user: -0.33246954766867753,
      z_score_pr: -0.3270967232738836
    },
    {
      name: 'moleculerjs/moleculer',
      z_score: -1.366010124852783,
      z_score_star: -0.5504288324534136,
      z_score_user: -0.39680207991364547,
      z_score_pr: -0.4187792124857239
    },
    {
      name: 'julienschmidt/httprouter',
      z_score: -1.3731398505007455,
      z_score_star: -0.33806293992043873,
      z_score_user: -0.5198730111648885,
      z_score_pr: -0.5152038994154181
    },
    {
      name: 'actionhero/actionhero',
      z_score: -1.3785046665299276,
      z_score_star: -0.8117480567643045,
      z_score_user: -0.5352568775712938,
      z_score_pr: -0.03149973219432941
    },
    {
      name: 'tinyhttp/tinyhttp',
      z_score: -1.4079075761908033,
      z_score_star: -0.5028842296475237,
      z_score_user: -0.4625331454682866,
      z_score_pr: -0.442490201074993
    },
    {
      name: 'rustasync/tide',
      z_score: -1.4445377801837258,
      z_score_star: -0.5528941081544597,
      z_score_user: -0.43176541265547586,
      z_score_pr: -0.4598782593737903
    },
    {
      name: 'balderdashy/sails',
      z_score: -1.486046068785035,
      z_score_star: -0.6448136735791801,
      z_score_user: -0.3576431472427954,
      z_score_pr: -0.48358924796305935
    },
    {
      name: 'hapijs/hapi',
      z_score: -1.4901888356042872,
      z_score_star: -0.5701510380617827,
      z_score_user: -0.4443522124425348,
      z_score_pr: -0.47568558509996967
    },
    {
      name: 'slimphp/Slim',
      z_score: -1.586289949174024,
      z_score_star: -0.684610267038925,
      z_score_user: -0.4639316787779598,
      z_score_pr: -0.4377480033571392
    },
    {
      name: 'sinatra/sinatra',
      z_score: -1.64784483048412,
      z_score_star: -0.6839059025529118,
      z_score_user: -0.48351114511338483,
      z_score_pr: -0.48042778281782345
    },
    {
      name: 'bcit-ci/CodeIgniter',
      z_score: -1.6509864364432394,
      z_score_star: -0.72335031376965,
      z_score_user: -0.4345624792748223,
      z_score_pr: -0.49307364339876697
    },
    {
      name: 'lukeed/polka',
      z_score: -1.700507528558637,
      z_score_star: -0.6684098838606217,
      z_score_user: -0.5184744778552153,
      z_score_pr: -0.5136231668428002
    },
    {
      name: 'salvo-rs/salvo',
      z_score: -1.7071851245111684,
      z_score_star: -0.7180675801245512,
      z_score_user: -0.5450466107390063,
      z_score_pr: -0.4440709336476109
    },
    {
      name: 'restify/node-restify',
      z_score: -1.7261325484176457,
      z_score_star: -0.7117282997504325,
      z_score_user: -0.5086847446875027,
      z_score_pr: -0.5057195039797104
    },
    {
      name: 'trillium-rs/trillium',
      z_score: -1.7361988177882388,
      z_score_star: -0.7839256595667837,
      z_score_user: -0.536655410880967,
      z_score_pr: -0.41561774734048806
    },
    {
      name: 'linnovate/mean',
      z_score: -1.7464659616286142,
      z_score_star: -0.7737123745195926,
      z_score_user: -0.4765184785650187,
      z_score_pr: -0.4962351085440028
    },
    {
      name: 'gotham-rs/gotham',
      z_score: -1.7556896813230178,
      z_score_star: -0.7744167390056058,
      z_score_user: -0.5324598109519474,
      z_score_pr: -0.44881313136546475
    },
    {
      name: 'emicklei/go-restful',
      z_score: -1.75889234939967,
      z_score_star: -0.7222937670406302,
      z_score_user: -0.5324598109519474,
      z_score_pr: -0.5041387714070925
    },
    {
      name: 'go-martini/martini',
      z_score: -1.810942536509057,
      z_score_star: -0.7289852296577555,
      z_score_user: -0.5604304771454117,
      z_score_pr: -0.5215268297058898
    },
    {
      name: 'urfave/negroni',
      z_score: -1.8227651204953959,
      z_score_star: -0.7451856128360587,
      z_score_user: -0.5576334105260653,
      z_score_pr: -0.5199460971332719
    },
    {
      name: 'trezm/Thruster',
      z_score: -1.8255249328646808,
      z_score_star: -0.7835734773237771,
      z_score_user: -0.5520392772873725,
      z_score_pr: -0.4899121782535311
    },
    {
      name: 'strongloop/loopback',
      z_score: -1.8274283982332484,
      z_score_star: -0.7846300240527969,
      z_score_user: -0.5212715444745617,
      z_score_pr: -0.5215268297058898
    },
    {
      name: 'System-Glitch/goyave',
      z_score: -1.8469835245626125,
      z_score_star: -0.7955476735860013,
      z_score_user: -0.5520392772873725,
      z_score_pr: -0.49939657368923873
    },
    {
      name: 'savsgio/atreugo',
      z_score: -1.8515046684289338,
      z_score_star: -0.7779385614356716,
      z_score_user: -0.5520392772873725,
      z_score_pr: -0.5215268297058898
    },
    {
      name: 'totaljs/framework',
      z_score: -1.8835940351919462,
      z_score_star: -0.815622061437377,
      z_score_user: -0.5464451440486795,
      z_score_pr: -0.5215268297058898
    }
  ]
});

registerStaticData(query('archive-2021-archive-ranking', params => params?.repo === 'programming_language_repos'), {
  expiresAt: '2099-12-31T00:00:00.000+08:00',
  params: { repo: 'db_repos' },
  requestedAt: '2022-03-14T12:39:54.417+08:00',
  spent: 54.503,
  sql: "WITH stars AS (\n    SELECT \n        db.name AS repo_name,\n        COUNT(*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' WatchEvent \'\' AND event_year = 2021\nGROUP BY 1\n    ),\n    prs AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' PullRequestEvent \'\' AND event_year = 2021 AND ACTION = \'\' opened \'\'\nGROUP BY 1\n    ),\n    contributors AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (DISTINCT actor_id) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE IN (\n    \'\' IssuesEvent \'\'\n    , \'\' PullRequestEvent \'\'\n    , \'\' IssueCommentEvent \'\'\n    , \'\' PullRequestReviewCommentEvent \'\'\n    , \'\' CommitCommentEvent \'\'\n    , \'\' PullRequestReviewEvent \'\')\n  AND event_year = 2021\nGROUP BY 1\n    ),\n    raw AS (\nSELECT\n    NAME,\n    stars.count AS star_count,\n    prs.count AS pr_count,\n    contributors.count AS user_count\nFROM db_repos\n    LEFT JOIN stars\nON stars.repo_name = NAME\n    LEFT JOIN prs ON prs.repo_name = NAME\n    LEFT JOIN contributors ON contributors.repo_name = NAME\n    ),\n\n    zz_pr AS (\nSELECT AVG (pr_count) AS mean, STDDEV(pr_count) AS sd\nFROM raw\n    ),\n    zz_star AS (\nSELECT AVG (star_count) AS mean, STDDEV(star_count) AS sd\nFROM raw\n    ),\n    zz_user AS (\nSELECT AVG (user_count) AS mean, STDDEV(user_count) AS sd\nFROM raw\n    )\n\nSELECT name,\n       ((star_count - zz_star.mean) / zz_star.sd) +\n       ((user_count - zz_user.mean) / zz_user.sd) +\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score,\n       ((star_count - zz_star.mean) / zz_star.sd) AS z_score_star,\n       ((user_count - zz_user.mean) / zz_user.sd) AS z_score_user,\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score_pr\nFROM raw,\n     zz_star,\n     zz_user,\n     zz_pr\nORDER BY 2 DESC",
  data: [
    {
      name: 'rust-lang/rust',
      z_score: 9.640784053280044,
      z_score_star: 2.8996868568426546,
      z_score_user: 3.152785588893984,
      z_score_pr: 3.588311607543404
    },
    {
      name: 'golang/go',
      z_score: 7.421620881855486,
      z_score_star: 3.6867871409068225,
      z_score_user: 4.003370276821081,
      z_score_pr: -0.26853653587241716
    },
    {
      name: 'Microsoft/TypeScript',
      z_score: 6.615429529109207,
      z_score_star: 2.4163898558527004,
      z_score_user: 4.069032990259633,
      z_score_pr: 0.13000668299687348
    },
    {
      name: 'nodejs/node',
      z_score: 5.2099470374042784,
      z_score_star: 2.31270173725089,
      z_score_user: 1.8860003173256008,
      z_score_pr: 1.011244982827788
    },
    {
      name: 'python/cpython',
      z_score: 5.181334445694115,
      z_score_star: 1.513693293907522,
      z_score_user: 0.7081122577971036,
      z_score_pr: 2.9595288939894893
    },
    {
      name: 'apple/swift',
      z_score: 3.1567043859278954,
      z_score_star: 0.6853501167300284,
      z_score_user: -0.1596457551831529,
      z_score_pr: 2.63100002438102
    },
    {
      name: 'JuliaLang/julia',
      z_score: 3.1276957700428003,
      z_score_star: 1.545351571015638,
      z_score_user: 0.6707350209166967,
      z_score_pr: 0.9116091781104655
    },
    {
      name: 'dotnet/roslyn',
      z_score: 3.091121510362229,
      z_score_star: -0.15112546190643053,
      z_score_user: 0.9182329408004718,
      z_score_pr: 2.324014031468188
    },
    {
      name: 'openjdk/jdk',
      z_score: 3.0311893062311817,
      z_score_star: 0.7553468578589821,
      z_score_user: -0.005085829704713739,
      z_score_pr: 2.2809282780769133
    },
    {
      name: 'PowerShell/PowerShell',
      z_score: 2.4228239698927596,
      z_score_star: 1.9354163981367367,
      z_score_user: 0.7990298610197148,
      z_score_pr: -0.31162228926369184
    },
    {
      name: 'vlang/v',
      z_score: 2.406134391626864,
      z_score_star: 1.1430881417060907,
      z_score_user: 0.14543331340827603,
      z_score_pr: 1.1176129365124974
    },
    {
      name: 'ziglang/zig',
      z_score: 1.3108647249194074,
      z_score_star: 0.6414932374334641,
      z_score_user: 0.41818612307610986,
      z_score_pr: 0.25118536440983347
    },
    {
      name: 'JetBrains/kotlin',
      z_score: 0.6508385251982185,
      z_score_star: 1.1837501490009186,
      z_score_user: -0.2798590305552722,
      z_score_pr: -0.25305259324742785
    },
    {
      name: 'php/php-src',
      z_score: 0.627329663556083,
      z_score_star: 0.5825333268559637,
      z_score_user: -0.03741208862830886,
      z_score_pr: 0.08220842532842815
    },
    {
      name: 'nim-lang/Nim',
      z_score: 0.24872407766248253,
      z_score_star: -0.10000750987864696,
      z_score_user: -0.09499323733596265,
      z_score_pr: 0.44372482487709214
    },
    {
      name: 'dart-lang/sdk',
      z_score: 0.2274292231284054,
      z_score_star: -0.2280928328573547,
      z_score_user: 1.0485481720862146,
      z_score_pr: -0.5930261161004545
    },
    {
      name: 'micropython/micropython',
      z_score: -0.13035493135161158,
      z_score_star: -0.07154410477226744,
      z_score_user: 0.14644350899963837,
      z_score_pr: -0.2052543355789825
    },
    {
      name: 'crystal-lang/crystal',
      z_score: -0.42552340180910864,
      z_score_star: -0.06834923277053095,
      z_score_user: -0.20308416561173384,
      z_score_pr: -0.15409000342684384
    },
    {
      name: 'ruby/ruby',
      z_score: -0.44265993883406873,
      z_score_star: -0.2614937674209633,
      z_score_user: -0.30511392033933094,
      z_score_pr: 0.12394774892622548
    },
    {
      name: 'elixir-lang/elixir',
      z_score: -0.5231579017429498,
      z_score_star: -0.08926112223644245,
      z_score_user: -0.1384316477645436,
      z_score_pr: -0.2954651317419638
    },
    {
      name: 'dotnet/fsharp',
      z_score: -0.7316862215504771,
      z_score_star: -0.5182452991968765,
      z_score_user: -0.19803318765492212,
      z_score_pr: -0.015407734698678517
    },
    {
      name: 'dotnet/csharplang',
      z_score: -0.7345689116510884,
      z_score_star: -0.13544154480699694,
      z_score_user: -0.020238763575148953,
      z_score_pr: -0.5788886032689425
    },
    {
      name: 'erlang/otp',
      z_score: -0.7383665095939863,
      z_score_star: -0.412524080230324,
      z_score_user: -0.12933988744228248,
      z_score_pr: -0.19650254192137984
    },
    {
      name: 'AssemblyScript/assemblyscript',
      z_score: -0.7927484785218764,
      z_score_star: 0.0963318967735219,
      z_score_user: -0.3828989808742317,
      z_score_pr: -0.5061813944211665
    },
    {
      name: 'dlang/dmd',
      z_score: -0.8666740478054766,
      z_score_star: -0.6013119712420248,
      z_score_user: -0.4243170001200879,
      z_score_pr: 0.15895492355663615
    },
    {
      name: 'chapel-lang/chapel',
      z_score: -0.8765337904019728,
      z_score_star: -0.5943413414200543,
      z_score_user: -0.4243170001200879,
      z_score_pr: 0.1421245511381695
    },
    {
      name: 'pharo-project/pharo',
      z_score: -0.8974070234604234,
      z_score_star: -0.6047972861530101,
      z_score_user: -0.3768378073260576,
      z_score_pr: 0.08422807001864416
    },
    {
      name: 'coq/coq',
      z_score: -0.9090950864944546,
      z_score_star: -0.5121459981026523,
      z_score_user: -0.3525931131333612,
      z_score_pr: -0.04435597525844118
    },
    {
      name: 'ocaml/ocaml',
      z_score: -1.1454516856849282,
      z_score_star: -0.5031422679159404,
      z_score_user: -0.28086922614663457,
      z_score_pr: -0.3614401916223532
    },
    {
      name: 'scala/scala',
      z_score: -1.2679726327085974,
      z_score_star: -0.45057210134191295,
      z_score_user: -0.430378173668262,
      z_score_pr: -0.3870223576984225
    },
    {
      name: 'racket/racket',
      z_score: -1.3661012901223737,
      z_score_star: -0.5191166279246228,
      z_score_user: -0.32935861453202725,
      z_score_pr: -0.5176260476657238
    },
    {
      name: 'cue-lang/cue',
      z_score: -1.3671295097486755,
      z_score_star: -0.2841483143423674,
      z_score_user: -0.42330680452872554,
      z_score_pr: -0.6596743908775825
    },
    {
      name: 'HaxeFoundation/haxe',
      z_score: -1.3872522716256985,
      z_score_star: -0.43692128460722074,
      z_score_user: -0.35057272195063655,
      z_score_pr: -0.5997582650678411
    },
    {
      name: 'purescript/purescript',
      z_score: -1.464235521283006,
      z_score_star: -0.4462154577031814,
      z_score_user: -0.4344189560337114,
      z_score_pr: -0.5836011075461132
    },
    {
      name: 'ring-lang/ring',
      z_score: -1.5194378863731517,
      z_score_star: -0.6010215283327761,
      z_score_user: -0.5212957768908733,
      z_score_pr: -0.3971205811495025
    },
    {
      name: 'rakudo/rakudo',
      z_score: -1.543812167113377,
      z_score_star: -0.6210620890709412,
      z_score_user: -0.407143675066928,
      z_score_pr: -0.5156064029755079
    },
    {
      name: 'ponylang/ponyc',
      z_score: -1.5796005955884607,
      z_score_star: -0.5316056730223199,
      z_score_user: -0.479877757645017,
      z_score_pr: -0.5681171649211239
    },
    {
      name: 'lucee/Lucee',
      z_score: -1.5979862778485736,
      z_score_star: -0.6341320199871359,
      z_score_user: -0.5101836253858875,
      z_score_pr: -0.4536706324755505
    },
    {
      name: 'elm/compiler',
      z_score: -1.614862175032275,
      z_score_star: -0.5066275828269257,
      z_score_user: -0.44452091194733484,
      z_score_pr: -0.6637136802580145
    },
    {
      name: 'jashkenas/coffeescript',
      z_score: -1.6591853698631276,
      z_score_star: -0.5095320119194133,
      z_score_user: -0.48795932237591577,
      z_score_pr: -0.6616940355677985
    },
    {
      name: 'clojure/clojure',
      z_score: -1.6643619501970606,
      z_score_star: -0.4685795617153367,
      z_score_user: -0.5253365592563226,
      z_score_pr: -0.6704458292254012
    },
    {
      name: 'beefytech/Beef',
      z_score: -1.6680335703685936,
      z_score_star: -0.5830140679593523,
      z_score_user: -0.4738165840968429,
      z_score_pr: -0.6112029183123985
    },
    {
      name: 'red/red',
      z_score: -1.6788345495527488,
      z_score_star: -0.5426425035737732,
      z_score_user: -0.4960408871068146,
      z_score_pr: -0.6401511588721611
    },
    {
      name: 'cqfn/eo',
      z_score: -1.7005626097243076,
      z_score_star: -0.6071208294270003,
      z_score_user: -0.4930103003327275,
      z_score_pr: -0.6004314799645798
    },
    {
      name: 'livecode/livecode',
      z_score: -1.7552191440566998,
      z_score_star: -0.6318084767131458,
      z_score_user: -0.5223059724822356,
      z_score_pr: -0.6011046948613185
    },
    {
      name: 'terralang/terra',
      z_score: -1.7687428989562641,
      z_score_star: -0.5975362134217909,
      z_score_user: -0.5162447989340615,
      z_score_pr: -0.6549618866004119
    },
    {
      name: 'ChavaScript/chavascript',
      z_score: -1.7719736590265245,
      z_score_star: -0.6068303865177515,
      z_score_user: -0.5041224518377133,
      z_score_pr: -0.6610208206710598
    },
    {
      name: 'IoLanguage/io',
      z_score: -1.7973694751393654,
      z_score_star: -0.6143819021582195,
      z_score_user: -0.5152346033426992,
      z_score_pr: -0.6677529696384465
    },
    {
      name: 'idris-lang/Idris-dev',
      z_score: -1.8084790083327356,
      z_score_star: -0.6291944905299068,
      z_score_user: -0.5142244077513368,
      z_score_pr: -0.6650601100514918
    },
    {
      name: 'skiplang/skip',
      z_score: -1.8286745099206576,
      z_score_star: -0.6355842345333798,
      z_score_user: -0.5273569504390474,
      z_score_pr: -0.6657333249482305
    },
    {
      name: 'gkz/LiveScript',
      z_score: -1.839322030064403,
      z_score_star: -0.6384886636258674,
      z_score_user: -0.5303875372131344,
      z_score_pr: -0.6704458292254012
    },
    {
      name: 'gosu-lang/gosu-lang',
      z_score: -1.847955697445642,
      z_score_star: -0.6498159370865695,
      z_score_user: -0.5283671460304097,
      z_score_pr: -0.6697726143286625
    },
    {
      name: 'programming-nu/nu',
      z_score: -1.8537849285594499,
      z_score_star: -0.6512681516328134,
      z_score_user: -0.5313977328044968,
      z_score_pr: -0.6711190441221399
    },
    {
      name: 'eclipse/golo-lang',
      z_score: null,
      z_score_star: -0.6509777087235646,
      z_score_user: -0.5303875372131344,
      z_score_pr: null
    },
    {
      name: 'Frege/frege',
      z_score: null,
      z_score_star: -0.6146723450674683,
      z_score_user: -0.5334181239872214,
      z_score_pr: null
    },
    {
      name: 'goby-lang/goby',
      z_score: null,
      z_score_star: -0.6050877290622588,
      z_score_user: -0.5313977328044968,
      z_score_pr: null
    },
    {
      name: 'SenegalLang/Senegal',
      z_score: null,
      z_score_star: -0.6445879647200916,
      z_score_user: -0.532407928395859,
      z_score_pr: null
    },
    {
      name: 'typelead/eta',
      z_score: null,
      z_score_star: -0.6335511341686384,
      z_score_user: -0.5283671460304097,
      z_score_pr: null
    }
  ]
});

registerStaticData(query('archive-2021-archive-ranking', params => params?.repo === 'nocode_repos'), {
  expiresAt: '2099-12-31T00:00:00.000+08:00',
  params: { repo: 'db_repos' },
  requestedAt: '2022-03-14T12:39:54.417+08:00',
  spent: 54.503,
  sql: "WITH stars AS (\n    SELECT \n        db.name AS repo_name,\n        COUNT(*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' WatchEvent \'\' AND event_year = 2021\nGROUP BY 1\n    ),\n    prs AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (*) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE = \'\' PullRequestEvent \'\' AND event_year = 2021 AND ACTION = \'\' opened \'\'\nGROUP BY 1\n    ),\n    contributors AS (\nSELECT /*+ read_from_storage(tiflash[github_events]), MAX_EXECUTION_TIME(120000) */\n    db.name AS repo_name,\n    COUNT (DISTINCT actor_id) AS COUNT\nFROM github_events\n    JOIN db_repos db\nON db.id = github_events.repo_id\nWHERE TYPE IN (\n    \'\' IssuesEvent \'\'\n    , \'\' PullRequestEvent \'\'\n    , \'\' IssueCommentEvent \'\'\n    , \'\' PullRequestReviewCommentEvent \'\'\n    , \'\' CommitCommentEvent \'\'\n    , \'\' PullRequestReviewEvent \'\')\n  AND event_year = 2021\nGROUP BY 1\n    ),\n    raw AS (\nSELECT\n    NAME,\n    stars.count AS star_count,\n    prs.count AS pr_count,\n    contributors.count AS user_count\nFROM db_repos\n    LEFT JOIN stars\nON stars.repo_name = NAME\n    LEFT JOIN prs ON prs.repo_name = NAME\n    LEFT JOIN contributors ON contributors.repo_name = NAME\n    ),\n\n    zz_pr AS (\nSELECT AVG (pr_count) AS mean, STDDEV(pr_count) AS sd\nFROM raw\n    ),\n    zz_star AS (\nSELECT AVG (star_count) AS mean, STDDEV(star_count) AS sd\nFROM raw\n    ),\n    zz_user AS (\nSELECT AVG (user_count) AS mean, STDDEV(user_count) AS sd\nFROM raw\n    )\n\nSELECT name,\n       ((star_count - zz_star.mean) / zz_star.sd) +\n       ((user_count - zz_user.mean) / zz_user.sd) +\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score,\n       ((star_count - zz_star.mean) / zz_star.sd) AS z_score_star,\n       ((user_count - zz_user.mean) / zz_user.sd) AS z_score_user,\n       ((pr_count - zz_pr.mean) / zz_pr.sd)       AS z_score_pr\nFROM raw,\n     zz_star,\n     zz_user,\n     zz_pr\nORDER BY 2 DESC",
  data: [
    {
      name: 'tiangolo/fastapi',
      z_score: 4.327905929842272,
      z_score_star: 2.391138629803466,
      z_score_user: 2.451378071821119,
      z_score_pr: -0.5146107717823125
    },
    {
      name: 'strapi/strapi',
      z_score: 3.921797867590492,
      z_score_star: 0.5552047014726972,
      z_score_user: 2.59858742464328,
      z_score_pr: 0.7680057414745151
    },
    {
      name: 'appsmithorg/appsmith',
      z_score: 2.883786077051822,
      z_score_star: 0.4039929822696069,
      z_score_user: -0.01009924629826451,
      z_score_pr: 2.4898923410804796
    },
    {
      name: 'supabase/supabase',
      z_score: 2.6777156197321186,
      z_score_star: 2.2186956831452793,
      z_score_user: 0.469187018704119,
      z_score_pr: -0.01016708211727973
    },
    {
      name: 'directus/directus',
      z_score: 2.297444427791107,
      z_score_star: -0.4942013883879779,
      z_score_user: 0.7345062011161527,
      z_score_pr: 2.057139615062932
    },
    {
      name: 'appwrite/appwrite',
      z_score: 0.4078630583856716,
      z_score_star: 0.6060948191894929,
      z_score_user: 0.06350543011281581,
      z_score_pr: -0.26173719091663716
    },
    {
      name: 'nocodb/nocodb',
      z_score: 0.060053571397013394,
      z_score_star: 1.533299798354423,
      z_score_user: -0.48938551130064795,
      z_score_pr: -0.9838607156567616
    },
    {
      name: 'hasura/graphql-engine',
      z_score: 0.019240320705647518,
      z_score_star: -0.24558533559318624,
      z_score_user: 1.2617210926187745,
      z_score_pr: -0.9968954363199407
    },
    {
      name: 'saleor/saleor',
      z_score: 0.002110650291535565,
      z_score_star: -0.2775132119951249,
      z_score_user: -0.4414568848004096,
      z_score_pr: 0.7210807470870702
    },
    {
      name: 'keystonejs/keystone',
      z_score: -0.14851297133584107,
      z_score_star: -0.7674521478482247,
      z_score_user: -0.581819290979679,
      z_score_pr: 1.2007584674920626
    },
    {
      name: 'n8n-io/n8n',
      z_score: -0.1698818571958452,
      z_score_star: 0.1445182100893844,
      z_score_user: -0.3798343650143889,
      z_score_pr: 0.06543429772915929
    },
    {
      name: 'cube-js/cube.js',
      z_score: -0.5317588794526872,
      z_score_star: -0.7569175693399708,
      z_score_user: -0.3746991550322205,
      z_score_pr: 0.5998578449195041
    },
    {
      name: 'Budibase/budibase',
      z_score: -0.7474793632877791,
      z_score_star: 0.15489071815904976,
      z_score_user: -0.5715488710153422,
      z_score_pr: -0.3308212104314866
    },
    {
      name: 'TryGhost/Ghost',
      z_score: -0.8760299035121965,
      z_score_star: -0.4959841632124516,
      z_score_user: -0.3490231051213786,
      z_score_pr: -0.031022635178366356
    },
    {
      name: 'ToolJet/ToolJet',
      z_score: -1.4954351475523935,
      z_score_star: -0.45190100391637383,
      z_score_user: -0.6879469639444925,
      z_score_pr: -0.355587179691527
    },
    {
      name: 'artf/grapesjs',
      z_score: -2.2046396522496003,
      z_score_star: -0.709106789956357,
      z_score_user: -0.42433951819318166,
      z_score_pr: -1.0711933441000618
    },
    {
      name: 'parse-community/parse-server',
      z_score: -2.2958045289954616,
      z_score_star: -0.9432985737167703,
      z_score_user: -0.6280361808191945,
      z_score_pr: -0.7244697744594967
    },
    {
      name: 'webiny/webiny-js',
      z_score: -2.394489073525826,
      z_score_star: -0.9763609431888286,
      z_score_user: -0.853985420034604,
      z_score_pr: -0.5641427103023933
    },
    {
      name: 'rowyio/rowy',
      z_score: -2.839108210487569,
      z_score_star: -0.9590194062598568,
      z_score_user: -0.9327253064278527,
      z_score_pr: -0.94736349779986
    },
    {
      name: 'graphile/postgraphile',
      z_score: -2.8947779351924803,
      z_score_star: -0.9304950090682771,
      z_score_user: -0.853985420034604,
      z_score_pr: -1.1102975060895992
    }
  ]
});
