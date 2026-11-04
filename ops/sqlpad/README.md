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


## Replacing the shared default encryption key

`rekey-connections.mjs` re-encrypts connection data inside one SQLite transaction while preserving its plaintext and all unrelated metadata. It defaults to a dry run, verifies the expected connection count, and rolls back every row if any decryption or update fails. Tests cover ciphertext preservation in dry runs, successful rekeying, preservation of user password hashes and timestamps, corrupt later rows, wrong source keys, and incorrect counts.

Run it only against an offline data copy, with the original database retained for rollback. Mount this directory read-only at `/usr/app/maintenance` in the built image, mount the offline copy at `/var/lib/sqlpad`, disable container networking, and supply these values through a private environment file (never command-line key values or committed files):

- `SQLPAD_DB_PATH=/var/lib/sqlpad`
- `SQLPAD_REKEY_OFFLINE_COPY=1`
- `SQLPAD_REKEY_EXPECTED_CONNECTIONS` set to the verified count
- `SQLPAD_REKEY_SOURCE_PASSPHRASE` set to the original encryption key
- `SQLPAD_PASSPHRASE` set to the new random key, at least 32 characters
- `SQLPAD_REKEY_MODE=check` for validation, then `apply` for the copied database

Use `node /usr/app/maintenance/rekey-connections.mjs` as the container entry point. The replacement service must retain the new `SQLPAD_PASSPHRASE`; keep a separate private key backup. Never use that key with the original rollback database. Give the new service its own random `SQLPAD_COOKIE_SECRET` as well; changing this signing key requires users to sign in again but does not change their passwords.

MySQL2 connections now explicitly verify the certificate hostname when server-certificate validation is enabled. Production connections must enable TLS and leave “Do not validate server certificate” unchecked; retain the trusted CA and require TLS 1.2 or newer.
