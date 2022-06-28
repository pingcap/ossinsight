---
title: 'Docker Compose'
sidebar_position: 3
---

## 0. Install TiDB

Please follow [this section](/workshop/mini-ossinsight/step-by-step/load-data-to-tidb#a-install-tidb) to install TiDB.

## 1. Install Docker Compose

:::note
We suppose you have knowledge about Docker/Container/Docker Compose.
:::

If you haven't installed Docker Compose, please install it with this [doc](https://docs.docker.com/compose/install/), then verfiy it:

```bash
docker-compose --version
```

## 2. Start mini OSS Insight!

[Create GitHub personal access token](/workshop/mini-ossinsight/step-by-step/find-data-source#creating-a-personal-access-token) first, then clone repo:
```bash
git clone https://github.com/pingcap/ossinsight.git;
cd ossinsight/;
export GITHUB_TOKEN=(personal access token);
docker-compose pull;
docker-compose up;
```

then open another terminal tab to load sample events data:
```bash
# if you want to get different size of data please visit: 
# https://github.com/pingcap/ossinsight/releases/tag/sample
wget https://github.com/pingcap/ossinsight/releases/download/sample/sample1m.sql.zip;
unzip sample1m.sql.zip;
mysql --host 127.0.0.1 --port 4000 -u root -p gharchive_dev < sample1m.sql
```

## 3. Well Done!

Visit: http://127.0.0.1:3000/;
