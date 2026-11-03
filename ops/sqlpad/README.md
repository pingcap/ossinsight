# OSSInsight SQLPad runtime

This builds SQLPad 7.5.7 on Node 24.22.2 with patched dependencies, replacing the legacy SQLPad container. SQLPad upstream is archived; this recipe pins its source commit, archive checksum, Linux amd64 Node image digest, and both npm dependency graphs.

Build from the repository root:

```sh
docker build -t ossinsight/sqlpad:security-20261104 ops/sqlpad
```

The build runs the upstream server suite plus region-validation regression tests, the client TypeScript check and production build, and production dependency audits. ODBC remains optional and excluded, as in the standard upstream deployment. Native SQLite is compiled against the same base image used at runtime. The runtime runs as uid 1000 and includes the audit reports under `/usr/share/doc/sqlpad`.

The client audit has no findings. The server audit permits only AWS's low-severity informational advisory [GHSA-j965-2qgj-vjmq](https://github.com/advisories/GHSA-j965-2qgj-vjmq), whose documented input-sanitization mitigation is applied before all Athena operations. All other findings, audit failures, and incomplete reports fail the build. AWS SDK v2 remains unsupported upstream; migrating the unused Athena driver to SDK v3 remains a maintenance consideration.

For rollout, first take a consistent SQLite backup and a private copy of the complete data directory. Test migration on that copy, preserving user/query/connection identities and password hashes, and verify authenticated MySQL connectivity with a read-only query. Never start a staging container against the live data directory. Keep credentials and encryption keys in private host files, outside this repository and image.

Stop the old container before taking the final copy. Use the migrated copy for the replacement; retain the old container and its original data as the rollback pair. Bind staging only to loopback and production only to the existing private origin address. Run with a read-only root filesystem, writable data mount and `/tmp` tmpfs, dropped capabilities, `no-new-privileges`, and bounded memory/CPU. Confirm login, saved queries, database connectivity, anonymous-access rejection, and container health before disabling the old container's restart policy. Rollback requires stopping the replacement and restarting the old container with its original data; do not point the old image at a migrated database.

To update dependencies, edit the manifests and regenerate their npm locks with scripts disabled (the client retains upstream's legacy peer-dependency resolution). Review changes and rebuild the full image. Do not use upstream's Yarn Dockerfile: it does not apply these npm overrides or audits.
