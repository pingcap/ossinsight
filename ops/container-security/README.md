# API and ETL container verification

Build from the repository root:

```sh
docker build -f packages/api-server/Dockerfile -t ossinsight-api-security:test .
docker build -f etl/Dockerfile -t ossinsight-etl-security:test etl
python3 ops/container-security/check.py
```

The verifier uses disposable TiDB and Redis containers on an internal Docker network. It creates synthetic database accounts and certificates, publishes no host ports, and removes its containers, volumes and network on exit. It does not use deployment credentials. Tests exercise certificate/hostname validation and rejection of plaintext connections through both mysql2 and the SQL import CLI, actual Rails ingestion and deduplication, schema dumping, API startup, operator authentication, SQLite exports and graceful shutdown.

The runtime images use pinned Node 24 / Ruby 3.4 manifests and non-root users. Application code, configuration and installed dependencies are owned by root and cannot be rewritten by the runtime user. Install/build tools stay in build stages, and the API runtime removes npm, Yarn and their bundled dependencies. Dependency installation uses frozen lockfiles; JavaScript lifecycle scripts are disabled except the explicitly selected, source-built SQLite module. Ruby lockfile checksums cover the resolved gems. CI audits Ruby dependencies and scans both final images for fixable high/critical OS and library vulnerabilities using a checksum-verified Trivy release. Environment files, private keys and encrypted Rails credentials are excluded from image contexts.

Run with a read-only root filesystem, all capabilities dropped, `no-new-privileges`, process/memory limits, and a writable temporary filesystem at `/tmp`. Supply environment variables and any custom CA through your deployment's private configuration mechanism, outside the image. The API requires dedicated database accounts with verified TLS, Redis, and the existing provider configuration. `API_SERVER_PORT` defaults to 3450; its healthcheck follows that setting. The ETL default UID/GID is 10001; the API uses the image's `node` user.

ETL starts the realtime worker directly. It never installs gems, creates databases, migrates schemas, seeds collections or changes replicas at startup. Perform any required schema or reviewed sample import explicitly under an appropriately scoped maintenance account. The image includes the MariaDB client and selects its hostname-verifying TLS flags; external deployments using Oracle's MySQL client retain `VERIFY_IDENTITY`. Both variants fail closed when verification fails.

ETL requires its existing `DATABASE_URL` and `GITHUB_TOKEN`; use production Rails settings and the deployment's `SECRET_KEY_BASE` where required. For the image's MariaDB client, `SAMPLE_MYSQL_CLIENT_FLAVOR=mariadb` is set automatically. `DB_SSL_CA` defaults to the operating system CA bundle. Archive caches, dumps and Bootsnap caches default to `/tmp`; mount separate owned volumes if those outputs must persist. Preserve any existing deployment-specific capture/deduplication code and durable paths when upgrading a customized live worker.

The worker heartbeat advances after a completed poll or while deliberately waiting for a known rate limit. It expires after five minutes without progress; rejected credentials or repeated failures must not remain healthy indefinitely. A Docker health status alone does not restart a container: configure the deployment's existing monitoring and recovery policy. One-shot maintenance commands can disable the worker healthcheck.

Roll out the ETL upgrade after verifying its real database connection and customized capture path in staging. Keep the previous service definition, source and runtime available for rollback. Stop the previous poller before starting its replacement so two writers cannot race the event deduplication check. Verify fresh event ingestion and capture output before retiring the old runtime.
