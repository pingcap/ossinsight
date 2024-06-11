---
title: Data Preparation for Analytics
description: In this section, we will explain step by step how we process the massive data archived by GH Archive which up to 4.7 billion rows.
image: ./thumbnail.png
date: 2022-03-01
authors: [hooopo]
tags: [tidbcloud]
---

## Data

All the data we use here on this website sources from [GH Archive](https://www.gharchive.org/), a non-profit project that records and archives all GitHub events data since 2011. The total data volume archived by GH Archive can be up to 4 billion rows. We download the `json file` on GH Archive and convert it into csv format via Script, and finally load it into the TiDB cluster in parallel through [TiDB-Lightning](https://docs.pingcap.com/tidb/stable/tidb-lightning-overview).

In this section, we will explain step by step how we conduct this process. 

1. Prepare the data in csv format for TiDB Lighting. 

<!--truncate-->

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

2. Configure the TiDB Lightning as follows.

```
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

3. Load the data into the TiDB cluster. 

```bash
nohup tidb-lightning -config ./tidb-lightning.toml > nohup.out
```

4. Convert the unstructured `json file` provided by GH Archive into structured data. 

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

5. With structured data at hand, we can start to make further analysis with TiDB Cloud. Execute SQL commands to generate analytical results. For example, you can execute SQL commands below to output the top 10 most starred JavaScript framework repos in 2021.

```
  SELECT js.name, count(*) as stars 
    FROM github_events 
         JOIN js_framework_repos js ON js.id = github_events.repo_id 
   WHERE type = 'WatchEvent' and event_year = 2021 
GROUP BY 1 
ORDER BY 2 DESC
   LIMIT 10;
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

We have analyzed all the GitHub projects regarding databases, JavaScript frameworks, programming languages, web frameworks, and low-code development tools, and provided valuable insights in 2021, in real time, and custom insights. If the repository you care about is not included here, you're welcome to submit your PR [here](https://github.com/hooopo/gharchive/tree/main/meta/repos). If you want to gain more insights into other areas, you can try TiDB Cloud by yourselves with this [10-minute tutorial](/blog/try-it-yourself/). 

Below are the areas of GitHub projects we have analyzed. 

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

:::info
### 🌟 Details in how OSS Insight works

Go to read [Use TiDB Cloud to Analyze GitHub Events in 10 Minutes](/blog/try-it-yourself) and use the [Serverless Tier](https://tidbcloud.com/free-trial/?utm_source=ossinsight&utm_medium=community) TiDB Cloud Cluster.

You can find the reason [How we implement OSS Insight ?](/blog/why-we-choose-tidb-to-support-ossinsight) as well!
:::
