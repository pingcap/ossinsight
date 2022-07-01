---
title: 'Step 2: Load Data  to TiDB'
sidebar_position: 2
---

## 1. Prepare Environment

### a. Install TiDB

It's easy to setup a TiDB Cluster in your laptop (Mac or Linux) with the official cli tools: [tiup](https://tiup.io/)(inspired by rustup)

```bash
# Install tiup, you'd better use bash
curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh
# Install & Start TiDB Server.
tiup playground -T ossinsight
```

Expected output:
```bash
CLUSTER START SUCCESSFULLY, Enjoy it ^-^
To connect TiDB: mysql --comments --host 127.0.0.1 --port 4000 -u root -p (no password)
To view the dashboard: http://127.0.0.1:2379/dashboard
PD client endpoints: [127.0.0.1:2379]
To view the Prometheus: http://127.0.0.1:9090
To view the Grafana: http://127.0.0.1:3000
```

### b. Config data loader script

Clone OSS Insight repo:
```bash
git clone https://github.com/pingcap/ossinsight.git;
```

edit `ossinsight/backend/.env.local`, fill in `database uri` and `GitHub personal access token`(Learn how to [create a personal access token](/workshop/mini-ossinsight/step-by-step/find-data-source#creating-a-personal-access-token))
```
DATABASE_URL=tidb://root@127.0.0.1:4000/gharchive_dev
GITHUB_TOKEN=(your github personal access token)
```

then initial data loader script environment with:
```bash
# Homebrew: https://brew.sh/
brew install openssl ruby@2.7 mysql;
cd ossinsight/backend/;
bundle update --bundler;
bundle install;
```

### c. Initial database schema

```bash
cd ossinsight/backend/;

# Create database
bundle exec rails db:create

# Create tables, index
bundle exec rails db:migrate
```


## 2. Load sample historical GitHub events to TiDB

```bash
cd ossinsight/backend/;

# Load seed data, e.g: collections, collection_items
bundle exec rake db:seed

# Load about 3.9 million sample events data
wget https://github.com/pingcap/ossinsight/releases/download/sample/sample5m.sql.zip;
unzip sample5m.sql.zip;
mysql --host 127.0.0.1 --port 4000 -u root -p gharchive_dev < sample5m.sql
```

The importing task would cost about 10 minutes.

:::note
if you want to get different size of data please visit: 
https://github.com/pingcap/ossinsight/releases/tag/sample
:::


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
