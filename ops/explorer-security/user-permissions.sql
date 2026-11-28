CREATE TABLE IF NOT EXISTS explorer_user_permissions (
  user_id BIGINT NOT NULL,
  permission VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (user_id, permission)
);
