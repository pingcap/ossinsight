CREATE TABLE IF NOT EXISTS `sys_repo_star_snapshots`
(
    `repo_id` BIGINT NOT NULL COMMENT 'The repository ID (github_repos.repo_id / GraphQL databaseId).',
    `snapshot_day` DATE NOT NULL COMMENT 'The UTC day this snapshot belongs to.',
    `stargazer_count` INT NOT NULL COMMENT 'Total stargazers reported by the GitHub GraphQL API (stargazerCount) at retrieval time.',
    `forks_count` INT NULL COMMENT 'Total forks reported by the GitHub GraphQL API (forkCount) at retrieval time.',
    `retrieved_at` DATETIME NOT NULL COMMENT 'When the value was actually fetched from the API (UTC).',
    `source` VARCHAR(32) NOT NULL DEFAULT 'github_graphql' COMMENT 'Provenance of the snapshot, for example: github_graphql.',
    PRIMARY KEY (`repo_id`, `snapshot_day`)
);
