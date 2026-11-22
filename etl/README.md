# GH Archive for TiDB

## Importing an approved sample

`gh:load_sample` requires `SAMPLE_SQL_PATH` pointing to an already prepared local SQL file,
`SAMPLE_SQL_SHA256` from an independently trusted release manifest, and an explicit `DATABASE_URL`.
Use a dedicated database and a loader account restricted to that database. Automatic download
and ZIP extraction from the old third-party CDN have been removed. The importer verifies the
opened file before use, keeps credentials in a temporary mode-0600 option file, disables local
file loading and mysql shell commands, and requires verified TLS. Set `SAMPLE_MYSQL_SSL_CA`
when the server uses a private CA. Do not derive the expected digest from an untrusted download.

## Repository seeds and archive transport

`rails db:seed` uses the same private option-file importer and verified TLS, even
when `DB_FORCE_SSL` is unset. Its default CA bundle is `/etc/ssl/cert.pem`; set
`DB_SSL_CA` to your trusted bundle when needed. The reviewed `db/seed.sql` is pinned
by SHA-256 in `db/seeds.rb`. When intentionally updating seed data, review the SQL
and update that pin in the same change. Never compute the expected digest from
the input during seeding.

Hourly archives use the [official GH Archive HTTPS endpoint](https://www.gharchive.org/).
Only hourly archive filenames are accepted. Downloads verify the server certificate,
reject redirects, and use bounded connection/read timeouts. A missing archive may
be skipped; certificate, redirect and server failures stop the import instead of
being reported as missing data.


## github_events


**Shared columns**

name               | column_type | ext_info | ref | default | comment
------------------ | ----------- | -------- | --- | ------- | -------
id                 | bigint      | [null]   |     |         |        
type               | varchar     | [null]   |     |         |        
created_at         | datetime    | [null]   |     |         |        
repo_id            | bigint      | [null]   |     |         |        
repo_name          | varchar     | [null]   |     |         | 
actor_login        | varchar     | [null]   |     |         |       
actor_id           | bigint      | [null]   |     |         | 
org_login          | varchar     | [null]   |     |         |        
org_id             | bigint      | [null]   |     |         |            
event_day          | date        | [null]   |     |         |        
event_month        | date        | [null]   |     |         | 
event_year         | int         | [null]   |     |         |   
action             | varchar     | [null]   |     |         |  


        
**PullRequestEvent**
name               | column_type | ext_info | ref | default | comment
------------------ | ----------- | -------- | --- | ------- | -------
language           | varchar     | [null]   |     |         |        
additions          | bigint      | [null]   |     |         |        
deletions          | bigint      | [null]   |     |         |              
number             | int         | [null]   |     |         |        
state              | varchar     | [null]   |     |         |        
closed_at          | datetime    | [null]   |     |         |        
comments           | int         | [null]   |     |         |        
pr_merged_at       | datetime    | [null]   |     |         |        
pr_merged          | tinyint     | [null]   |     |         |        
pr_changed_files   | int         | [null]   |     |         |        
pr_review_comments | int         | [null]   |     |         |        
pr_or_issue_id     | bigint      | [null]   |     |         |           



**IssuesEvent**
name               | column_type | ext_info | ref | default | comment
------------------ | ----------- | -------- | --- | ------- | -------
number             | int         | [null]   |     |         |        
state              | varchar     | [null]   |     |         |        
closed_at          | datetime    | [null]   |     |         |    
comments           | int         | [null]   |     |         |    


**PushEvent**
name               | column_type | ext_info | ref | default | comment
------------------ | ----------- | -------- | --- | ------- | -------      
push_size          | int         | [null]   |     |         |        
push_distinct_size | int         | [null]   |     |         |        

**IssueCommentEvent**

name               | column_type | ext_info | ref | default | comment
------------------ | ----------- | -------- | --- | ------- | ------- 

**PullRequestReviewCommentEvent**

name               | column_type | ext_info | ref | default | comment
------------------ | ----------- | -------- | --- | ------- | -------
commit_id          | bigint      | [null]   |     |         |        
comment_id         | bigint      | [null]   |     |         |       


**PullRequestReviewEvent**

name               | column_type | ext_info | ref | default | comment
------------------ | ----------- | -------- | --- | ------- | ------- 

**CommitCommentEvent**

name               | column_type | ext_info | ref | default | comment
------------------ | ----------- | -------- | --- | ------- | ------- 
commit_id          | bigint      | [null]   |     |         |        
comment_id         | bigint      | [null]   |     |         |       
      

## [cn_orgs](https://github.com/hooopo/gharchive/blob/main/meta/orgs/cn_orgs.yml)



name    | column_type | ext_info       | ref | default | comment
------- | ----------- | -------------- | --- | ------- | -------
id      | varchar     | [pk, not null] |     |         |        
name    | varchar     | [null]         |     |         |        
company | varchar     | [null]         |     |         |        

## [cn_repos](https://github.com/hooopo/gharchive/blob/main/meta/repos/cn_repos.yml)



name    | column_type | ext_info       | ref | default | comment
------- | ----------- | -------------- | --- | ------- | -------
id      | varchar     | [pk, not null] |     |         |        
name    | varchar     | [null]         |     |         |        
company | varchar     | [null]         |     |         |        

## [db_repos](https://github.com/hooopo/gharchive/blob/main/meta/repos/db_repos.yml)



name | column_type | ext_info       | ref | default | comment
---- | ----------- | -------------- | --- | ------- | -------
id   | varchar     | [pk, not null] |     |         |        
name | varchar     | [null]         |     |         |        

     

## users



name         | column_type | ext_info       | ref | default | comment
------------ | ----------- | -------------- | --- | ------- | -------
id           | int         | [pk, not null] |     |         |        
login        | varchar     | [not null]     |     |         |        
company      | varchar     | [null]         |     |         |        
created_at   | timestamp   | [not null]     |     |         |        
type         | varchar     | [not null]     |     |         |        
fake         | tinyint     | [not null]     |     |         |        
deleted      | tinyint     | [not null]     |     |         |        
long         | decimal     | [null]         |     |         |        
lat          | decimal     | [null]         |     |         |        
country_code | char        | [null]         |     |         |        
state        | varchar     | [null]         |     |         |        
city         | varchar     | [null]         |     |         |        
location     | varchar     | [null]         |     |         |        



## Usage

* set DATABASE_URL env in .env.local
* bundle exec rails db:create
* bundle exec rails db:migrate
* bundle exec rake gh:import
* bundle exec rake gh:load_meta
* bundle exec rake gh:load_collection

### Realtime Fetch Github Event

* bundle exec rails runner 'Realtime.new(ENV["GITHUB_TOKEN"].split(","), 500).run'
* bundle exec rails runner 'Realtime.clean!' # every 5 minutes

### Automatic Tweet for trending repo

* bundle exec rails runner 'TrendingRepoGenerator.new(1).generate' # every 1 hour

### Automatic Tweet for collection

* bundle exec rails runner 'CollectionTweetGenerator.new(1).generate' # every day


### Realtime Fetch Hackernews Item
* bundle exec rails runner 'HnRealtime.new.run'

Database connections now require `VERIFY_IDENTITY` TLS by default. Set `DB_SSL_CA`
to a trusted CA bundle path when the OpenSSL system trust store does not include
your database CA; `DB_FORCE_SSL` is no longer an opt-in switch. Use a hostname
present in the server certificate. Rails production also enables `force_ssl`;
terminate TLS at the trusted ingress and correctly forward the HTTPS scheme.
