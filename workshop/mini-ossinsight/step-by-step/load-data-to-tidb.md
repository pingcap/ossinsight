---
title: 'Step 2: Load Data  to TiDB'
sidebar_position: 2
---

## 1. Prepare Environment

### a. Install TiDB

It's easy to setup a TiDB Cluster in your laptop (Mac or Linux) with the official cli tools: tiup.

```bash
# Install tiup ("tiup" is inspired by rustup -:)
curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh
# Install & Start TiDB Server
tiup playground -T ossinsight
```

Expected output:
```
Playground Bootstrapping...
Start pd instance:v6.1.0
Start tikv instance:v6.1.0
Start tidb instance:v6.1.0
Waiting for tidb instances ready
127.0.0.1:4000 ... Done
Start tiflash instance:v6.1.0
Waiting for tiflash instances ready
127.0.0.1:3930 ... Done
CLUSTER START SUCCESSFULLY, Enjoy it ^-^
To connect TiDB: mysql --comments --host 127.0.0.1 --port 4000 -u root -p (no password)
To view the dashboard: http://127.0.0.1:2379/dashboard
PD client endpoints: [127.0.0.1:2379]
To view the Prometheus: http://127.0.0.1:9090
To view the Grafana: http://127.0.0.1:3000
```

### b. Config data loader script

[Create a personal access token](/workshop/mini-ossinsight/step-by-step/find-data-source#creating-a-personal-access-token), then edit `ossinsight/backend/.env.local`(if there is no such file, `/usr/bin/touch` one):
```
DATABASE_URL=tidb://root@127.0.0.1:4000/gharchive_dev
GITHUB_TOKEN=(your github personal token)
```

then initial data loader script environment with:
```bash
# brew install openssl ruby@2.7;
cd ossinsight/backend/;
bundle install;
```

### c. Inittial database schema

```bash
# pwd: ossinsight/backend/;
# Create database
bundle exec rails db:create

# Create tables, index
bundle exec rails db:migrate
```

### d. !!! Set Column-Oriented Storage Replica

This step is important enough that it adds column-oriented-storage ability to TiDB - We call it [TiFlash](https://docs.pingcap.com/tidb/dev/tiflash-overview). The `tiup playground` installed 1 TiFlash node by default, what we need to do is just make data is `STORED` in these replica node too.

1. It's easy to set TiFlash replica, different with other software, TiDB use SQL to take such changes into effect:

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


## 2. Load sample historical GitHub events to TiDB

```bash
# pwd: ossinsight/backend/;
# Load collections
bundle exec rake gh:load_collection
# Load 5 million events data
wget https://github.com/pingcap/ossinsight/releases/download/sample/sample1m.sql.zip;
unzip sample1m.sql;
mysql --comments --host 127.0.0.1 --port 4000 -u root -p gharchive_dev < sample3m.sql
```

The importing task would cost about 10mins.


## 3. Listen to /events and insert realtime events to TiDB

Start the crawler daemon by:

```bash
# pwd: ossinsight/backend/;
bundle exec rails runner 'Realtime.new(ENV["GITHUB_TOKEN"].to_s.split(","), 100).run';
```

## 4. Test

Connect to TiDB by:
```bash
# no password
mysql --comments --host 127.0.0.1 --port 4000 -u root -p
```

Execute the following SQL to check if it is ACTUALLY ready:

```sql
SELECT count(*) FROM gharchive_dev.github_events;
```
Try it again after a few seconds, make sure the results are different.

```
mysql> SELECT count(*) FROM gharchive_dev.github_events;
+----------+
| count(*) |
+----------+
|     5808 |
+----------+
1 row in set (0.00 sec)

mysql> SELECT count(*) FROM gharchive_dev.github_events;
+----------+
| count(*) |
+----------+
|     5872 |
+----------+
1 row in set (0.01 sec)

mysql>
```
