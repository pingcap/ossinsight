---
title: How it works
---

The Github Event data is obtained from [GH Archive](https://www.gharchive.org/), which provides the full github events data from 2011 to 2022, with a total volume of more than 4 billion.
We download the json file provided by GH Archive, convert it into csv format through script, and finally load it into the TiDB cluster in parallel through [lightning](https://docs.pingcap.com/tidb/stable/tidb-lightning-overview).

Prepare the CSV format for lightning:

```
├── gharchive_dev.github_events.000000000000.csv
├── gharchive_dev.github_events.000000000001.csv
├── gharchive_dev.github_events.000000000002.csv
├── gharchive_dev.github_events.000000000003.csv
├── gharchive_dev.github_events.000000000004.csv
├── gharchive_dev.github_events.000000000005.csv
├── gharchive_dev.github_events.000000000006.csv
├── gharchive_dev.github_events.000000000007.csv
├── gharchive_dev.github_events.000000000008.csv
├── gharchive_dev.github_events.000000000009.csv
├── gharchive_dev.github_events.000000000010.csv
├── gharchive_dev.github_events.000000000011.csv
├── gharchive_dev.github_events.000000000012.csv
├── gharchive_dev.github_events.000000000013.csv
```

Lightning Configuration Example:

```yml
cat tidb-lightning.toml
[mydumper.csv]
separator = ','
delimiter = '"'
header = true
not-null = false
backslash-escape = true
trim-last-separator = false

[tikv-importer]
 backend = "local"
 sorted-kv-dir = "/kvdir/"

disk-quota = "1.5TiB"

[mydumper]
data-source-dir = "/csv_dir/"
strict-format = false
no-schema = true

[tidb]
host = "xxx"
port = 3306
user = "github_events"
password = "******"

[lightning]
check-requirements = false
region-concurrency = 32
meta-schema-name = "gharchive_meta"
```

Load into TiDB cluster:

```bash
nohup tidb-lightning -config ./tidb-lightning.toml > nohup.out
```

Since the json data provided by GH Archive is unstructured, we process the github events data into structured ones:

```
gharchive_dev> desc github_events;
+--------------------+--------------+------+-----+---------+-------+
| Field              | Type         | Null | Key | Default | Extra |
+--------------------+--------------+------+-----+---------+-------+
| id                 | bigint(20)   | YES  | MUL | <null>  |       |
| type               | varchar(255) | YES  | MUL | <null>  |       |
| created_at         | datetime     | YES  | MUL | <null>  |       |
| repo_id            | bigint(20)   | YES  | MUL | <null>  |       |
| repo_name          | varchar(255) | YES  | MUL | <null>  |       |
| actor_id           | bigint(20)   | YES  | MUL | <null>  |       |
| actor_login        | varchar(255) | YES  | MUL | <null>  |       |
| actor_location     | varchar(255) | YES  |     | <null>  |       |
| language           | varchar(255) | YES  | MUL | <null>  |       |
| additions          | bigint(20)   | YES  | MUL | <null>  |       |
| deletions          | bigint(20)   | YES  | MUL | <null>  |       |
| action             | varchar(255) | YES  | MUL | <null>  |       |
| number             | int(11)      | YES  |     | <null>  |       |
| commit_id          | varchar(255) | YES  | MUL | <null>  |       |
| comment_id         | bigint(20)   | YES  | MUL | <null>  |       |
| org_login          | varchar(255) | YES  | MUL | <null>  |       |
| org_id             | bigint(20)   | YES  | MUL | <null>  |       |
| state              | varchar(255) | YES  |     | <null>  |       |
| closed_at          | datetime     | YES  | MUL | <null>  |       |
| comments           | int(11)      | YES  | MUL | <null>  |       |
| pr_merged_at       | datetime     | YES  | MUL | <null>  |       |
| pr_merged          | tinyint(1)   | YES  |     | <null>  |       |
| pr_changed_files   | int(11)      | YES  | MUL | <null>  |       |
| pr_review_comments | int(11)      | YES  | MUL | <null>  |       |
| pr_or_issue_id     | bigint(20)   | YES  | MUL | <null>  |       |
| event_day          | date         | YES  | MUL | <null>  |       |
| event_month        | date         | YES  | MUL | <null>  |       |
| author_association | varchar(255) | YES  |     | <null>  |       |
| event_year         | int(11)      | YES  | MUL | <null>  |       |
| push_size          | int(11)      | YES  |     | <null>  |       |
| push_distinct_size | int(11)      | YES  |     | <null>  |       |
+--------------------+--------------+------+-----+---------+-------+
```

In addition to the full amount of github events data, we also extracted data from popular fields for further analysis, such as database fields, front-end framework fields, programming language fields, etc. If you find any missing repo, you can submit PR [here](https://github.com/hooopo/gharchive/tree/main/meta/repos)

All tables:

```
gharchive_dev> show tables;
+-----------------------------+
| Tables_in_gharchive_dev     |
+-----------------------------+
| cn_repos                    |
| css_framework_repos         |
| db_repos                    |
| github_events               |
| js_framework_repos          |
| nocode_repos                |
| programming_language_repos  |
| static_site_generator_repos |
| web_framework_repos         |
+-----------------------------+
```

With subdivided repo data, we can easily analyze and explore repo in a certain field through SQL JOIN, such as the ranking of Top 10 JavaScript Framework Stars in 2021:

```sql
select js.name, count(*) as stars 
from github_events 
join js_framework_repos js on js.id = github_events.repo_id 
where type = 'WatchEvent' and event_year = 2021 
group by 1 
order by 2 desc 
limit 10;
+-------------------+-------+
| name              | stars |
+-------------------+-------+
| facebook/react    | 22830 |
| sveltejs/svelte   | 18573 |
| vuejs/vue         | 18015 |
| angular/angular   | 11037 |
| alpinejs/alpine   | 6993  |
| preactjs/preact   | 2965  |
| hotwired/stimulus | 1355  |
| marko-js/marko    | 1006  |
| neomjs/neo        | 826   |
| tastejs/todomvc   | 813   |
+-------------------+-------+
```