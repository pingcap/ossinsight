---
title: 'Step 3: Get Insights with SQL'
sidebar_position: 3
---

Now, the data is ready, let's try to analyze these data with SQL!

## 1. Get Insights With Raw SQL!

### a. Can't Wait!

Let's test this dataset with a SQL: look at GitHub bots' growth:

```sql
WITH bots_with_first_seen AS (
    SELECT
        actor_login, MIN(event_year) AS first_seen_at
    FROM github_events ge
    WHERE
        actor_login REGEXP '^(bot-.+|.+bot|.+\\[bot\\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+)$'
    GROUP BY actor_login
    ORDER BY first_seen_at
),  acc AS (
    SELECT
        COUNT(actor_login) OVER (ORDER BY first_seen_at) AS cnt,
        first_seen_at AS event_year
    FROM
        bots_with_first_seen AS bwfs
    ORDER BY event_year
)
SELECT ANY_VALUE(cnt) AS bots_total, event_year
FROM acc
GROUP BY event_year
ORDER BY event_year;
```

the result is:
```sql
+------------+------------+
| bots_total | event_year |
+------------+------------+
|         20 |       2011 |
|         32 |       2012 |
|         57 |       2013 |
|         85 |       2014 |
|        119 |       2015 |
|        157 |       2016 |
|        193 |       2017 |
|        219 |       2018 |
|        241 |       2019 |
|        266 |       2020 |
|        287 |       2021 |
|        295 |       2022 |
+------------+------------+
12 rows in set (3.41 sec)
```

it works, but could it be faster?Of course.

### b. !!! Set Column-Oriented Storage Replica

This step is important enough that it adds column-oriented-storage ability to TiDB - We call it [TiFlash](https://docs.pingcap.com/tidb/dev/tiflash-overview). The `tiup playground` installed 1 TiFlash node by default, what we need to do is just make data is `STORED` in these replica node too.

i. It's easy to set TiFlash replica, different with other software, TiDB use SQL to take such changes into effect:

```sql
use gharchive_dev;
ALTER TABLE github_events SET TIFLASH REPLICA 1;
```

ii. Setting a TiFlash replica will take you some time, so you can use the following SQL statements to check if the procedure is done or not.

```sql
SELECT * FROM information_schema.tiflash_replica WHERE TABLE_SCHEMA = 'gharchive_dev' and TABLE_NAME = 'github_events';
```

If the results you get are the same as follows, then it means the procedure is done.

```sql
mysql> SELECT * FROM information_schema.tiflash_replica WHERE TABLE_SCHEMA = 'gharchive_dev' and TABLE_NAME = 'github_events';
+---------------+---------------+----------+---------------+-----------------+-----------+----------+
| TABLE_SCHEMA  | TABLE_NAME    | TABLE_ID | REPLICA_COUNT | LOCATION_LABELS | AVAILABLE | PROGRESS |
+---------------+---------------+----------+---------------+-----------------+-----------+----------+
| gharchive_dev | github_events |       68 |             1 |                 |         1 |        1 |
+---------------+---------------+----------+---------------+-----------------+-----------+----------+
1 row in set (0.27 sec)

mysql>
```

Now try to execute the former robot sql (begin with: `WITH bots_with_first_seen`  again, this is the result:
```sql
+------------+------------+
| bots_total | event_year |
+------------+------------+
|         20 |       2011 |
|         32 |       2012 |
|         57 |       2013 |
|         85 |       2014 |
|        119 |       2015 |
|        157 |       2016 |
|        193 |       2017 |
|        219 |       2018 |
|        241 |       2019 |
|        266 |       2020 |
|        287 |       2021 |
|        295 |       2022 |
+------------+------------+
12 rows in set (0.05 sec)
```

**IT IS SUPER FASTER**!

We provide a all-in-one script to run `SET TIFLASH REPLICA` on all tables:
```bash
cd ossinsight/backend/;
bundle exec rake gh:set_tiflash_replica
```

We won't talk too much about how to get USEFUL insights from such a big data as we are also students in open source software field. All SQLs in this project can be found on page, just click the `SHOW SQL` button on top-right of each chart to get the corresponding SQL.


## 2. Make Data More Beautiful

### a. Config

Create config file:
```bash
cd ossinsight/api/;
cp .env.template .env;
```

then edit `.env`:
```
# For database connection
DB_HOST=127.0.0.1
DB_PORT=4000
DB_USER=root
DB_DATABASE=gharchive_dev
DB_PASSWORD=''
CONNECTION_LIMIT=10
QUEUE_LIMIT=20
SERVER_PORT=3450
# comma separated tokens
GH_TOKENS='(your github personal access token)'
PREFETCH_CONCURRENT=3
```

### b. Start Prefetch Service

Open another terminal tab, then:

```bash
cd ossinsight/api/;
npm run prefetch;
```

### c. Start API

Open another terminal tab, then:

```bash
cd ossinsight/api/;
npm install -g pnpm;
pnpm install;
pnpm run dev;
```

### d. Start Web UI

Open another terminal tab, then:

```bash
cd ossinsight/;
npm install;
APP_HOST=http://localhost:3450 APP_API_BASE=http://localhost:3450 npm run start;
```
