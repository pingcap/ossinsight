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


## Security boundaries

Public named queries use the reviewed analytics catalog in `@ossinsight/types`.
New queries default to private; explicitly set `public: true` only after reviewing
both the returned data and parameter constraints. `public: false` always overrides
the compatibility catalog. The internal prefetch job opts into private queries.

`/q/playground` and `/explorer/answer` require an authenticated bearer session.
LLM generation reserves the user's daily quota transactionally before calling the
provider, including failed attempts. Cache hits never re-prepare existing answers.
Only registered `/v1` routes can forward requests using Data Service credentials.

Client identity defaults to the socket peer. When deploying behind a reverse
proxy, set `TRUSTED_PROXY_CIDRS` to its exact network ranges (comma separated) and
use the package start command, which enables the exported Fastify options.
The proxy must replace untrusted forwarding headers; never configure all networks
as trusted. Public clients cannot choose their quota identity with IP headers.

### Public query transport limits

`PUBLIC_API_HOURLY_RATE_LIMIT` (default 600) now caps one client's total queries across
HTTP named-query, metadata and public-proxy routes, WebSocket handshakes and WebSocket
queries. Redis reservations are atomic, failures deny requests, and sockets allow at
most two concurrent queries and 16 KiB messages. Configure `TRUSTED_PROXY_CIDRS` with
only the actual reverse-proxy networks; HTTP and sockets use the same trust boundary.

CORS configuration now lists exact origins. Public consumers receive no credentialed
access. Localhost is enabled only in development. For a trusted preview, explicitly
set its exact origin in `CORS_PRIVATE_ORIGINS`; broad hosting-provider patterns are
not accepted. WebSocket handshakes require a configured Origin, including for CLI
clients. Socket errors and audit events omit raw requests, SQL and internal errors.
