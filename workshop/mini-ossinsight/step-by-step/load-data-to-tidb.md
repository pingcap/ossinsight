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

### b. Inittial database schema

TODO @hooopo

```bash
mysql xxx << path/to/schema.sql
```

### c. !!! Set Column-Oriented Storage Replica

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

### d. Initial etl script

After [creating a personal access token](/workshop/mini-ossinsight/step-by-step/find-data-source#creating-a-personal-access-token), config it in etl script:

TODO @hooopo


## 2. Load historical GitHub events to TiDB

### a. Load Sample Data

TODO @hooopo

### b. Load all GitHub historical events data (optional)

We won't recommend to load all GitHub historical events data to your laptop, but if you are trying a production-level TiDB / TiDB Cloud cluster, you can do it hour by hour with the following method: 

```bash
./etl.rb --mysql mysql://user:pass@host:port/db --day YYYY-MM-DD-HH
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
SELECT count(*) FROM github_events;
```

