-- Administrative bootstrap for deployments whose maintenance account has no DDL privileges.
CREATE TABLE IF NOT EXISTS sys_email_rekey_state (
    migration_id VARCHAR(64) PRIMARY KEY,
    output_key_sha256 CHAR(64) NOT NULL,
    legacy_key_sha256 CHAR(64) NOT NULL,
    backup_key_sha256 CHAR(64) NOT NULL,
    database_sha256 CHAR(64) NOT NULL,
    backup_directory_sha256 CHAR(64) NOT NULL,
    max_id BIGINT UNSIGNED NOT NULL,
    last_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
    scanned BIGINT UNSIGNED NOT NULL DEFAULT 0,
    changed BIGINT UNSIGNED NOT NULL DEFAULT 0,
    complete TINYINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
