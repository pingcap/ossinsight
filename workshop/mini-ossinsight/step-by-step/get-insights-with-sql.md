---
title: 'Step 3: Get Insights with SQL'
sidebar_position: 3
---

Now, the data is ready, let's try to analyze these data with SQL!

## 1. Get Insights With Raw SQL!


We won't talk too much about how to get USEFUL insights from such a big data as we are also students in open source software field. All SQLs in this project can be found on page, just click the `SHOW SQL` button on top-right of each chart to get the corresponding SQL.


## 2. Make Data More Beautiful

### a. Config

Create config file:
```bash
cd ossinsight/api/;
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
GH_TOKENS='(your github personal access token)'
PREFETCH_CONCURRENT=3
```

### b. Start Prefetch Service

Open another terminal tab, then:

```bash
cd ossinsight/api/;
npm run prefetch;
```

### c. Start API

Open another terminal tab, then:

```bash
cd ossinsight/api/;
npm install -g pnpm;
pnpm install;
pnpm run dev;
```

### d. Start Web UI

Open another terminal tab, then:

```bash
cd ossinsight/;
npm install;
APP_HOST=http://localhost:3450 APP_API_BASE=http://localhost:3450 npm run start;
```
