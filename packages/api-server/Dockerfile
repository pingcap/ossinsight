ARG NODE_IMAGE=node:24.22.2-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c
FROM ${NODE_IMAGE} AS builder
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install --global pnpm@10.29.3 --ignore-scripts --no-audit --no-fund
WORKDIR /source
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/api-server/package.json ./packages/api-server/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/sql-policy/package.json ./packages/sql-policy/package.json
RUN pnpm install --filter @ossinsight/api-server... --frozen-lockfile --ignore-scripts --network-concurrency 8
COPY packages/api-server ./packages/api-server
COPY packages/types ./packages/types
COPY packages/sql-policy ./packages/sql-policy
RUN pnpm --filter @ossinsight/api-server... --workspace-concurrency 2 -r build
RUN pnpm --config.ignore-scripts=true --filter @ossinsight/api-server deploy --legacy --prod /runtime
# The reviewed sqlite3 native build is the only dependency script run.
RUN cd /runtime/node_modules/sqlite3 && npm_config_nodedir=/usr/local npm run rebuild && cd /runtime && node -e "require('sqlite3')"

FROM ${NODE_IMAGE} AS runtime
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
# Runtime only needs node; package-manager bundles have a separate CVE lifecycle.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /opt/yarn-* /usr/local/include/node \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx
ENV NODE_ENV=production CONFIGS_PATH=/app/configs
WORKDIR /app/packages/api-server
COPY --from=builder /runtime ./
COPY configs /app/configs
# Runtime users can read code and policy, but cannot rewrite the query allowlist.
RUN chmod -R a+rX,go-w /app && chmod 0555 docker-start.sh
USER node
EXPOSE 3450
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_SERVER_PORT||'3450')+'/healthy',{signal:AbortSignal.timeout(3000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["./docker-start.sh"]
