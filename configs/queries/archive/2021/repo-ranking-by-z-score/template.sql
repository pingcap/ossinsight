WITH repos AS (
    SELECT
        repo_id,
        repo_name
    FROM github_repos gr
    WHERE
        {% case field %}
        {% when 'database' %} gr.repo_name IN ('elastic/elasticsearch', 'clickhouse/clickhouse', 'apache/spark', 'pingcap/tidb', 'cockroachdb/cockroach', 'prometheus/prometheus', 'mongodb/mongo', 'trinodb/trino', 'tikv/tikv', 'redis/redis', 'apache/lucene-solr', 'apache/hbase', 'prestodb/presto', 'facebook/rocksdb', 'apache/druid', 'vitessio/vitess', 'apache/pinot', 'apache/hive', 'percona/percona-server', 'yugabyte/yugabyte-db', 'apache/ignite', 'apache/incubator-doris', 'citusdata/citus', 'timescale/timescaledb', 'apache/kylin', 'greenplum-db/gpdb', 'oceanbase/oceanbase', 'influxdata/influxdb', 'vesoft-inc/nebula', 'scylladb/scylla', 'apache/hadoop', 'apache/couchdb', 'crate/crate', 'questdb/questdb', 'taosdata/TDengine', 'MaterializeInc/materialize', 'StarRocks/starrocks', 'etcd-io/etcd', 'arangodb/arangodb', 'dgraph-io/dgraph', 'apple/foundationdb', 'apache/flink', 'MariaDB/server', 'confluentinc/ksql', 'postgres/postgres', 'mysql/mysql-server')
        {% when 'nocode' %} gr.repo_name IN ('appsmithorg/appsmith', 'hasura/graphql-engine', 'supabase/supabase', 'cube-js/cube.js', 'artf/grapesjs', 'nocodb/nocodb', 'n8n-io/n8n', 'ToolJet/ToolJet', 'graphile/postgraphile', 'strapi/strapi', 'directus/directus', 'saleor/saleor', 'TryGhost/Ghost', 'appwrite/appwrite', 'rowyio/rowy', 'tiangolo/fastapi', 'keystonejs/keystone', 'webiny/webiny-js', 'parse-community/parse-server', 'Budibase/budibase', 'lightdash/lightdash', 'lowdefy/lowdefy')
        {% when 'js_framework' %} gr.repo_name IN ('marko-js/marko', 'mithriljs/mithril.js', 'angular/angular', 'angular/angular.js', 'emberjs/ember.js', 'knockout/knockout', 'tastejs/todomvc', 'spine/spine', 'vuejs/vue', 'vuejs/core', 'Polymer/polymer', 'facebook/react', 'finom/seemple', 'aurelia/framework', 'optimizely/nuclear-js', 'jashkenas/backbone', 'dojo/dojo', 'jorgebucaran/hyperapp', 'riot/riot', 'daemonite/material', 'polymer/lit-element', 'aurelia/aurelia', 'sveltejs/svelte', 'neomjs/neo', 'preactjs/preact', 'hotwired/stimulus', 'alpinejs/alpine', 'solidjs/solid', 'ionic-team/stencil', 'jquery/jquery')
        {% when 'programming_language' %} gr.repo_name IN ('golang/go', 'apple/swift', 'Microsoft/TypeScript', 'rust-lang/rust', 'JetBrains/kotlin', 'python/cpython', 'php/php-src', 'JuliaLang/julia', 'ruby/ruby', 'jashkenas/coffeescript', 'elixir-lang/elixir', 'crystal-lang/crystal', 'PowerShell/PowerShell', 'scala/scala', 'dotnet/roslyn', 'clojure/clojure', 'micropython/micropython', 'erlang/otp', 'nim-lang/Nim', 'AssemblyScript/assemblyscript', 'purescript/purescript', 'elm/compiler', 'dotnet/csharplang', 'red/red', 'ponylang/ponyc', 'Frege/frege', 'goby-lang/goby', 'racket/racket', 'idris-lang/Idris-dev', 'ocaml/ocaml', 'typelead/eta', 'programming-nu/nu', 'gkz/LiveScript', 'IoLanguage/io', 'dlang/dmd', 'terralang/terra', 'dotnet/fsharp', 'skiplang/skip', 'rakudo/rakudo', 'chapel-lang/chapel', 'lucee/Lucee', 'eclipse/golo-lang', 'gosu-lang/gosu-lang', 'ziglang/zig', 'HaxeFoundation/haxe', 'livecode/livecode', 'coq/coq', 'vlang/v', 'dart-lang/sdk', 'pharo-project/pharo', 'ring-lang/ring', 'SenegalLang/Senegal', 'cqfn/eo', 'ChavaScript/chavascript', 'DennisMitchell/jellylanguage', 'beefytech/Beef', 'cue-lang/cue', 'openjdk/jdk', 'nodejs/node')
        {% when 'web_framework' %} gr.repo_name IN ('spring-projects/spring-boot', 'rails/rails', 'laravel/laravel', 'symfony/symfony', 'django/django', 'pallets/flask', 'savsgio/atreugo', 'go-chi/chi', 'labstack/echo', 'valyala/fasthttp', 'gin-gonic/gin', 'gogf/gf', 'emicklei/go-restful', 'gorilla/mux', 'System-Glitch/goyave', 'julienschmidt/httprouter', 'go-martini/martini', 'urfave/negroni', 'actix/actix-web', 'tokio-rs/axum', 'gotham-rs/gotham', 'SergioBenitez/rocket', 'trezm/Thruster', 'rustasync/tide', 'seanmonstar/warp', 'salvo-rs/salvo', 'trillium-rs/trillium', 'expressjs/express', 'nestjs/nest', 'meteor/meteor', 'strapi/strapi', 'koajs/koa', 'balderdashy/sails', 'fastify/fastify', 'feathersjs/feathers', 'hapijs/hapi', 'strongloop/loopback', 'linnovate/mean', 'adonisjs/core', 'restify/node-restify', 'lukeed/polka', 'moleculerjs/moleculer', 'totaljs/framework', 'actionhero/actionhero', 'tinyhttp/tinyhttp', 'phoenixframework/phoenix', 'sinatra/sinatra', 'cakephp/cakephp', 'dotnet/aspnetcore', 'spring-projects/spring-framework', 'playframework/playframework', 'yiisoft/yii2', 'slimphp/Slim', 'bcit-ci/CodeIgniter', 'beego/beego')
        {% endcase %}
), stars AS (
    SELECT
        repo_id,
        COUNT(*) AS stars
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND type = 'WatchEvent'
        AND action = 'started'
        AND created_at >= '2021-01-01' AND created_at < '2022-01-01'
    GROUP BY repo_id
), prs AS (
    SELECT
        repo_id,
        COUNT(*) AS prs
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND type = 'PullRequestEvent'
        AND action = 'opened'
        AND created_at >= '2021-01-01' AND created_at < '2022-01-01'
    GROUP BY repo_id
), contributors AS (
    SELECT
        repo_id,
        COUNT(DISTINCT actor_login) AS contributors
    FROM github_events ge
    WHERE
        repo_id IN (SELECT repo_id FROM repos)
        AND (
            (ge.type = 'PullRequestEvent' AND ge.action IN ('opened', 'closed')) OR
            (ge.type = 'IssuesEvent' AND ge.action IN ('opened', 'closed')) OR
            (ge.type = 'IssueCommentEvent' AND ge.action = 'created') OR
            (ge.type = 'PullRequestReviewEvent' AND ge.action = 'created') OR
            (ge.type = 'PullRequestReviewCommentEvent' AND ge.action = 'created') OR
            (ge.type = 'PushEvent' AND ge.action = '')
        )
        AND created_at >= '2021-01-01' AND created_at < '2022-01-01'
    GROUP BY repo_id
), raw AS (
    SELECT
        r.repo_id,
        r.repo_name,
        s.stars AS star_count,
        p.prs AS pr_count,
        c.contributors AS user_count
    FROM repos r
    LEFT JOIN stars s ON s.repo_id = r.repo_id
    LEFT JOIN prs p ON p.repo_id = r.repo_id
    LEFT JOIN contributors c ON c.repo_id = r.repo_id
), zz_pr AS (
    SELECT AVG(pr_count) AS mean, STDDEV(pr_count) AS sd FROM raw
), zz_star AS (
    SELECT AVG(star_count) AS mean, STDDEV(star_count) AS sd FROM raw
), zz_user AS (
    SELECT AVG(user_count) AS mean, STDDEV(user_count) AS sd FROM raw
)
SELECT
    repo_name,
    ROUND(
        ((star_count - zz_star.mean) / zz_star.sd) +
        ((user_count - zz_user.mean) / zz_user.sd) +
        ((pr_count - zz_pr.mean) / zz_pr.sd)
    , 3) AS z_score,
    ROUND((star_count - zz_star.mean) / zz_star.sd, 3) AS z_score_star,
    ROUND(((user_count - zz_user.mean) / zz_user.sd), 3) AS z_score_user,
    ROUND(((pr_count - zz_pr.mean) / zz_pr.sd), 3) AS z_score_pr
FROM raw, zz_star, zz_user, zz_pr
ORDER BY z_score DESC
LIMIT {{n}}