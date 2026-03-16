CREATE TABLE IF NOT EXISTS mv_repo_issue_creators (
    repo_id               INT      NOT NULL COMMENT 'The ID of the repository',
    user_id               INT      NOT NULL COMMENT 'The ID of the user',
    issues                INT      NULL COMMENT 'The number of issues created by the user',
    first_issue_opened_at DATETIME NULL COMMENT 'The datetime of the first issue opened by the user',
    PRIMARY KEY (repo_id, user_id)
);
