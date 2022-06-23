---
title: 'Step 2: Load Data  to TiDB'
sidebar_position: 2
---

## 1. Prepare Environment

#### a. Install TiDB
It's easy to setup a TiDB Cluster in your laptop (Mac or Linux) with the official cli tools: tiup.

```bash
# Install tiup (tiup is inspired by rustup -:)
curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh
# Install & Start TiDB Server
tiup playground -T mini-ossinsight
```

#### b. Inittial database schema

TODO @hooopo

```bash
mysql xxx << path/to/schema.sql
```

#### c. Initial etl script

It's quite easy to build a mini OSS Insight, there is no need to use an industrial ETL product, so we prepare a simple ETL script with Ruby.

After [creating a personal access token](/workshop/mini-ossinsight/find-data-source#creating-a-personal-access-token), then put it in TODO


## 2. Load historical GitHub events to TiDB

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
Feel free to run this command, because it is idempotent.
:::

## 3. Listen to /events and insert realtime events to TiDB


#### a. Config ETL Script
First of all, [creating a personal access token](/workshop/mini-ossinsight/find-data-source#creating-a-personal-access-token), 

#### b. Start the crawler daemon

```bash
./etl.rb --mysql mysql://user@pass:host:port/db --listen --token github-personal-token1,token2,token3
```
