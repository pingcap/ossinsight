---
title: 'Docker Compose'
sidebar_label: 'Docker Compose'
sidebar_position: 3
---

There are 2 reasons that we should't start TiDB inside container:

1. Performance loss on disk/network/cpu;
2. Posibility of changing database from TiDB to other like MySQL for comparison.

## 1. Install TiDB

It's easy to setup a TiDB Cluster in your laptop (Mac or Linux) with the official cli tools: [tiup](https://tiup.io/)(inspired by rustup)

```bash
# Install tiup
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

## 2. Install Docker Compose

:::note
We suppose you have knowledge about Docker / Container / Docker Compose.
:::

If you haven't installed Docker Compose, please install it with this [doc](https://docs.docker.com/compose/install/), then verfiy it:

```bash
docker-compose --version
```

## 3. Start mini OSS Insight!

### a. Clone the OSS Insight repository to local

<Tabs>
<TabItem value="github" label="GitHub" default>

```bash
git clone --depth=1 https://github.com/pingcap/ossinsight.git;
cd ossinsight;
```

</TabItem>
<TabItem value="ghproxy" label="GHProxy">

```bash
git clone --depth=1 https://ghproxy.com/https://github.com/pingcap/ossinsight.git;
cd ossinsight;
```

</TabItem>
</Tabs>

### b. Start up the mini OSSInsight program

Configure the necessary environment variables and start the mini OSSInsight through docker compose.

```bash
export GITHUB_TOKEN=<your personal access token>;
docker-compose pull;
docker-compose up;
```

:::note
Learn how to [create a personal access token](/workshop/mini-ossinsight/step-by-step/find-data-source#creating-a-personal-access-token)
:::

:::note
If you want to use another MySQL compatible database, please set the your database URL to `DATABASE_URL` environment variable before starting docker compose deployment in the `ossinsight/docker-compose.yml` file.

```
export DATABASE_URL=(your database URL);
```
:::

### c. Load sample historical GitHub events to TiDB

then open another terminal tab to load sample events data:

```bash
wget https://github.com/pingcap/ossinsight/releases/download/sample-data/smaple-oss-database.zip;
unzip smaple-oss-database.zip
cd dataset-xxs
mysql --host 127.0.0.1 --port 4000 -u root -p gharchive_dev < gharchive_dev.github_events.000000000.sql
```

The importing task would cost about 10 minutes.

:::note
If you want to get different size of data please visit: 
https://github.com/pingcap/ossinsight/releases/tag/sample-data
:::

## 4. Well Done!

Visit [http://localhost:30000](http://localhost:30000);
