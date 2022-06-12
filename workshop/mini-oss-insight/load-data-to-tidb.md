---
title: 'Step 2: Load Data  to TiDB'
sidebar_position: 2
---

## 0. Setup TiDB

```bash
# Install Tidb Package Manager
curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh
# Install & Start TiDB Server
tiup playground -T mini-ossinsight
```

## 1. Download the ETL Script

It's quite easy to build a mini OSS Insight, there is no need to use an industrial ETL tool, so we prepare a simple ETL script with Ruby.

⬇️  Download [etl.rb](.)

## 2. Load Historical GitHub events to TiDB

```bash
for y in {2011..2022}; do
    ./etl.rb --mysql mysql://user@pass:host:port/db --year $y
done
```

## 3. Subscribe to GitHub events api and insert real time events to TiDB

```bash
./etl.rb --mysql mysql://user@pass:host:port/db --listen --token github-personal-token1,token2,token3
```
