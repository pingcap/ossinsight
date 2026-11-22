ARG NODE_IMAGE=node:24.22.2-bookworm-slim@sha256:a43f7fc3e52e87d12a905f46eea0275def84ca8f2981a5b53fed44d7fb398ee0
FROM ${NODE_IMAGE} AS build
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl patch python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN curl --fail --location --silent --show-error https://codeload.github.com/sqlpad/sqlpad/tar.gz/ab1f0c03269f0178b9449d34505ce3462271f340 -o /tmp/sqlpad.tar.gz && printf '%s  /tmp/sqlpad.tar.gz\n' 'f89a0f541bc20e771f5f9fc970bc2678c9fbfce39a918057664b4ea11b0c3243' | sha256sum --check - && tar -xzf /tmp/sqlpad.tar.gz --strip-components=1 && rm /tmp/sqlpad.tar.gz
COPY security.patch /tmp/security.patch
RUN patch -p1 < /tmp/security.patch
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY audit-check.mjs /src/audit-check.mjs
RUN npm ci --prefix server --ignore-scripts --omit=optional --no-audit --no-fund && npm_config_build_from_source=true npm_config_jobs=2 npm rebuild sqlite3 --prefix server
RUN SQLPAD_BACKEND_DB_URI='' AWS_EC2_METADATA_DISABLED=true npm test --prefix server
RUN npm prune --prefix server --omit=dev --omit=optional --ignore-scripts --no-audit --no-fund
RUN (npm audit --prefix server --omit=dev --json > /src/server-audit.json || true) && node audit-check.mjs server server-audit.json
RUN npm ci --prefix client --legacy-peer-deps --no-audit --no-fund && npm run build --prefix client
RUN (npm audit --prefix client --omit=dev --json > /src/client-audit.json || true) && node audit-check.mjs client client-audit.json
RUN rm -rf server/public server/test && mkdir server/public && cp -a client/build/. server/public/

FROM ${NODE_IMAGE} AS runtime
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/app
COPY --from=build /src/server ./
# Private build contexts may supply mode-0600 manifests; runtime code is public.
RUN mv /usr/app/public/index.html /usr/app/public/index-template.html && chmod -R a+rX /usr/app
COPY --from=build /src/LICENSE.md /usr/share/doc/sqlpad/LICENSE
COPY --from=build /src/server-audit.json /src/client-audit.json /usr/share/doc/sqlpad/
ENV NODE_ENV=production SQLPAD_DB_PATH=/var/lib/sqlpad SQLPAD_PORT=3000
LABEL org.opencontainers.image.title="SQLPad OSSInsight security runtime" org.opencontainers.image.version="7.5.7+ossinsight.20261104" org.opencontainers.image.source="https://github.com/pingcap/ossinsight" org.opencontainers.image.revision="upstream:ab1f0c03269f0178b9449d34505ce3462271f340"
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/app').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "/usr/app/server.js"]
