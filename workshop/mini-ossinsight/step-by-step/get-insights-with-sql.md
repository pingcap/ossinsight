---
title: 'Step 3: Get Insights with SQL'
sidebar_position: 3
---

Now, the data is ready, let's try to analyze these data with SQL!

## 1. Get Insights With Raw SQL

We won't talk too much about how to get USEFUL insights from such a big data as we are also students in open source software field. All SQLs in this project can be found on page, just click the `SHOW SQL` button on top-right of each chart to get the corresponding SQL.

## 2. Make Data More Beautiful

### Method 1: Use OSS Insight Frontend UI

#### Start API Server

create config file:
```bash
cd api/;
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
GH_TOKENS='(your github token)'
PREFETCH_CONCURRENT=3
```

then run:
```bash
cd ossinsight/api/;
npm install -g pnpm;
pnpm install;
pnpm run dev;
```

#### Start Web UI

```bash
cd ossinsight/;
npm install;
APP_HOST=http://localhost:3450 APP_API_BASE=http://localhost:3450 npm run start;
```

### Method 2: Use 3rd Party Data Visualization Tools

Data Visualization Tool (or Business Intelligence Tool) is a big topic, look at this oss collection: https://ossinsight.io/collections/business-intelligence, here are some of them:

* [metabase/metabase](https://github.com/metabase/metabase) - Easy
* [ankane/blazer](https://github.com/ankane/blazer) - Easy
* [apache/superset](https://github.com/apache/superset)
* [dataease/dataease](https://github.com/dataease/dataease)
