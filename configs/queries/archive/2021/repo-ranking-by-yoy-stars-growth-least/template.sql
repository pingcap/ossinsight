SELECT
    gr.repo_id,
    gr.repo_name,
    stars2020,
    stars2021,
    ROUND(yoy, 3) AS yoy
FROM (
    SELECT
        repo_id,
        SUM(event_year = 2020) AS stars2020,
        SUM(event_year = 2021) AS stars2021,
        (SUM(event_year = 2021) - SUM(event_year = 2020)) / SUM(event_year = 2020) AS yoy
    FROM github_events ge
    WHERE
        type = 'WatchEvent'
        AND created_at BETWEEN '2020-01-01' AND '2022-01-01'
        AND repo_id IN (
            SELECT repo_id
            FROM github_repos gr
            WHERE
                {% case field %}
                {% when 'database' %} gr.repo_name IN ('elastic/elasticsearch', 'clickhouse/clickhouse', 'apache/spark', 'pingcap/tidb', 'cockroachdb/cockroach', 'prometheus/prometheus', 'mongodb/mongo', 'trinodb/trino', 'tikv/tikv', 'redis/redis', 'apache/lucene-solr', 'apache/hbase', 'prestodb/presto', 'facebook/rocksdb', 'apache/druid', 'vitessio/vitess', 'apache/pinot', 'apache/hive', 'percona/percona-server', 'yugabyte/yugabyte-db', 'apache/ignite', 'apache/incubator-doris', 'citusdata/citus', 'timescale/timescaledb', 'apache/kylin', 'greenplum-db/gpdb', 'oceanbase/oceanbase', 'influxdata/influxdb', 'vesoft-inc/nebula', 'scylladb/scylla', 'apache/hadoop', 'apache/couchdb', 'crate/crate', 'questdb/questdb', 'taosdata/TDengine', 'MaterializeInc/materialize', 'StarRocks/starrocks', 'etcd-io/etcd', 'arangodb/arangodb', 'dgraph-io/dgraph', 'apple/foundationdb', 'apache/flink', 'MariaDB/server', 'confluentinc/ksql', 'postgres/postgres', 'mysql/mysql-server')
                {% when 'nocode' %} gr.repo_name IN ('appsmithorg/appsmith', 'hasura/graphql-engine', 'supabase/supabase', 'cube-js/cube.js', 'artf/grapesjs', 'nocodb/nocodb', 'n8n-io/n8n', 'ToolJet/ToolJet', 'graphile/postgraphile', 'strapi/strapi', 'directus/directus', 'saleor/saleor', 'TryGhost/Ghost', 'appwrite/appwrite', 'rowyio/rowy', 'tiangolo/fastapi', 'keystonejs/keystone', 'webiny/webiny-js', 'parse-community/parse-server', 'Budibase/budibase', 'lightdash/lightdash', 'lowdefy/lowdefy')
                {% when 'js_framework' %} gr.repo_name IN ('marko-js/marko', 'mithriljs/mithril.js', 'angular/angular', 'angular/angular.js', 'emberjs/ember.js', 'knockout/knockout', 'tastejs/todomvc', 'spine/spine', 'vuejs/vue', 'vuejs/core', 'Polymer/polymer', 'facebook/react', 'finom/seemple', 'aurelia/framework', 'optimizely/nuclear-js', 'jashkenas/backbone', 'dojo/dojo', 'jorgebucaran/hyperapp', 'riot/riot', 'daemonite/material', 'polymer/lit-element', 'aurelia/aurelia', 'sveltejs/svelte', 'neomjs/neo', 'preactjs/preact', 'hotwired/stimulus', 'alpinejs/alpine', 'solidjs/solid', 'ionic-team/stencil', 'jquery/jquery')
                {% when 'programming_language' %} gr.repo_name IN ('golang/go', 'apple/swift', 'Microsoft/TypeScript', 'rust-lang/rust', 'JetBrains/kotlin', 'python/cpython', 'php/php-src', 'JuliaLang/julia', 'ruby/ruby', 'jashkenas/coffeescript', 'elixir-lang/elixir', 'crystal-lang/crystal', 'PowerShell/PowerShell', 'scala/scala', 'dotnet/roslyn', 'clojure/clojure', 'micropython/micropython', 'erlang/otp', 'nim-lang/Nim', 'AssemblyScript/assemblyscript', 'purescript/purescript', 'elm/compiler', 'dotnet/csharplang', 'red/red', 'ponylang/ponyc', 'Frege/frege', 'goby-lang/goby', 'racket/racket', 'idris-lang/Idris-dev', 'ocaml/ocaml', 'typelead/eta', 'programming-nu/nu', 'gkz/LiveScript', 'IoLanguage/io', 'dlang/dmd', 'terralang/terra', 'dotnet/fsharp', 'skiplang/skip', 'rakudo/rakudo', 'chapel-lang/chapel', 'lucee/Lucee', 'eclipse/golo-lang', 'gosu-lang/gosu-lang', 'ziglang/zig', 'HaxeFoundation/haxe', 'livecode/livecode', 'coq/coq', 'vlang/v', 'dart-lang/sdk', 'pharo-project/pharo', 'ring-lang/ring', 'SenegalLang/Senegal', 'cqfn/eo', 'ChavaScript/chavascript', 'DennisMitchell/jellylanguage', 'beefytech/Beef', 'cue-lang/cue', 'openjdk/jdk', 'nodejs/node')
                {% when 'web_framework' %} gr.repo_name IN ('spring-projects/spring-boot', 'rails/rails', 'laravel/laravel', 'symfony/symfony', 'django/django', 'pallets/flask', 'savsgio/atreugo', 'go-chi/chi', 'labstack/echo', 'valyala/fasthttp', 'gin-gonic/gin', 'gogf/gf', 'emicklei/go-restful', 'gorilla/mux', 'System-Glitch/goyave', 'julienschmidt/httprouter', 'go-martini/martini', 'urfave/negroni', 'actix/actix-web', 'tokio-rs/axum', 'gotham-rs/gotham', 'SergioBenitez/rocket', 'trezm/Thruster', 'rustasync/tide', 'seanmonstar/warp', 'salvo-rs/salvo', 'trillium-rs/trillium', 'expressjs/express', 'nestjs/nest', 'meteor/meteor', 'strapi/strapi', 'koajs/koa', 'balderdashy/sails', 'fastify/fastify', 'feathersjs/feathers', 'hapijs/hapi', 'strongloop/loopback', 'linnovate/mean', 'adonisjs/core', 'restify/node-restify', 'lukeed/polka', 'moleculerjs/moleculer', 'totaljs/framework', 'actionhero/actionhero', 'tinyhttp/tinyhttp', 'phoenixframework/phoenix', 'sinatra/sinatra', 'cakephp/cakephp', 'dotnet/aspnetcore', 'spring-projects/spring-framework', 'playframework/playframework', 'yiisoft/yii2', 'slimphp/Slim', 'bcit-ci/CodeIgniter', 'beego/beego')
                {% endcase %}
        )
    GROUP BY repo_id
    HAVING stars2020 > 0
    LIMIT 20
) sub
JOIN github_repos gr ON sub.repo_id = gr.repo_id
ORDER BY yoy