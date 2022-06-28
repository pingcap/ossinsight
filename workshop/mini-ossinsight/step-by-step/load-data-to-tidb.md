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
# Install & Start TiDB Server.
# Note: Grafana's port:3000 will confliect with Docusaurus:3000`, so run tiup with `--without-monitor` option
tiup playground --without-monitor -T ossinsight
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

Clone repo:
```bash
git clone https://github.com/pingcap/ossinsight.git;
```

Open another terminal tab, edit `ossinsight/backend/.env.local`

(Learn how to [create a personal access token](/workshop/mini-ossinsight/step-by-step/find-data-source#creating-a-personal-access-token))
```
DATABASE_URL=tidb://root@127.0.0.1:4000/gharchive_dev
GITHUB_TOKEN=(your github personal access token)
```

then initial data loader script environment with:
```bash
# Homebrew: https://brew.sh/
# brew install openssl ruby@2.7 mysql-client;
cd ossinsight/backend/;
bundle install;
```

### c. Inittial database schema

```bash
# Create database
cd ossinsight/backend/;
bundle exec rails db:create

# Create tables, index
bundle exec rails db:migrate
```


## 2. Load sample historical GitHub events to TiDB

```bash
cd ossinsight/backend/;

# Load collections
bundle exec rake gh:load_collection

# Load sample events data
# if you want to get different size of data please visit: 
# https://github.com/pingcap/ossinsight/releases/tag/sample
wget https://github.com/pingcap/ossinsight/releases/download/sample/sample1m.sql.zip;
unzip sample1m.sql.zip;
mysql --host 127.0.0.1 --port 4000 -u root -p gharchive_dev < sample1m.sql
```

The importing task would cost about 5 minutes.


## 3. Listen to /events and insert realtime events to TiDB

Open another terminal tab, start the crawler daemon by:

```bash
cd ossinsight/backend/;
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
