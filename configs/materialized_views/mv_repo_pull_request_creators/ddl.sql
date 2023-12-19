CREATE TABLE IF NOT EXISTS `mv_repo_pull_request_creators`
(
    `repo_id` INT NOT NULL COMMENT 'The ID of the repository',
    `user_id` INT NOT NULL COMMENT 'The ID of the user',
    `prs` INT NULL COMMENT 'The number of pull requests created by the user',
    `first_pr_opened_at` DATETIME NULL COMMENT 'The datetime of the first pull request opened by the user',
    `first_pr_merged_at` DATETIME NULL COMMENT 'The datetime of the first pull request merged for the user',
    PRIMARY KEY (`repo_id`, `user_id`)
);