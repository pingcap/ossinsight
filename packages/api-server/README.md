# API Server

This project is the API server of OSS Insight.

## Getting started

### Setup Environment Variables

Create a `.env` file in the `/packages/api-server` directory and fill in the following required environment variables:

| Name                   | Description                              | Default                                                                    |
|------------------------|------------------------------------------|----------------------------------------------------------------------------|
| `DATABASE_URL`         | Database URL to connect TiDB/MySQL.      | `mysql://root@localhost:4000/gharchive_dev?timezone=Z&decimalNumbers=true` |
| `REDIS_URL`            | URL to connect Redis.                    | `redis://localhost:6379/0`                                                 |
| `GITHUB_ACCESS_TOKENS` | Personal access token of GitHub account. |                                                                            |

If you need to see the complete env file configuration instructions, please see the schema definition on the [./src/env.ts](./src/env.ts) file.

### Install Dependencies

Install Node.js dependencies with the following command:

```shell
pnpm install --filter @ossinsight/api-server
```

### Initialize the Database Schema

TODO

### Start the Server

Start the API server in dev mode with the following command:

```shell
npm run dev
```

Open [http://localhost:3450](http://localhost:3450) to view it in the browser.
