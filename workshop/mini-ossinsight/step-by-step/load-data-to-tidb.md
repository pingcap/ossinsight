---
title: 'Step 2: Load Data  to TiDB'
sidebar_position: 2
---

## 1. Prepare Environment

### a. Install TiDB
It's easy to setup a TiDB Cluster in your laptop (Mac or Linux) with the official cli tools: tiup.

```bash
# Install tiup (tiup is inspired by rustup -:)
curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh
# Install & Start TiDB Server
tiup playground -T mini-ossinsight
```

### b. Inittial database schema

TODO @hooopo

```bash
mysql xxx << path/to/schema.sql
```

### c. !!! Set Column-Oriented Storage Replica

This step is important enough that it adds column-oriented engine to TiDB - We call it [TiFlash](https://docs.pingcap.com/tidb/dev/tiflash-overview).


1. It's easy to set TiFlash replica, different with other software, TiDB use SQL to take effect such changes:

```sql
use gharchive_dev;
ALTER TABLE github_events SET TIFLASH REPLICA 1;
```

2. Setting a TiFlash replica will take you some time, so you can use the following SQL statements to check if the procedure is done or not.

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

3. Repeat c.1 and c.2 on other tables.

### d. Initial etl script

It's quite easy to build a mini OSS Insight, there is no need to use an industrial ETL product, so we prepare a simple ETL script with Ruby.

After [creating a personal access token](/workshop/mini-ossinsight/step-by-step/find-data-source#creating-a-personal-access-token), then config it in TODO


## 2. Load historical GitHub events to TiDB

TODO @hooopo

```bash
...
./etl.rb --mysql mysql://user@pass:host:port/db --day 2015-01-01-15
./etl.rb --mysql mysql://user@pass:host:port/db --day 2015-01-01-16
...
...
./etl.rb --mysql mysql://user@pass:host:port/db --day 2022-06-01-01
...
```

:::info
Feel free to run a same command again, because it is an idempotent cmd, double execution won't insert duplicate data.
:::

## 3. Listen to /events and insert realtime events to TiDB

TODO @hooopo

Start the crawler daemon by:

```bash
./etl.rb --mysql mysql://user@pass:host:port/db --listen --token github-personal-token1,token2,token3
```

## 4. Test

Following the above steps, the data should be ready, but we still have to check if it is ACTUALLY ready. Count rows the sql below, and try it again 10s later, make sure the results are different:

```sql
SELECT count(*) FROM github_events WHERE event_type = 'WatchEvent';
```

