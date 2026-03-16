CREATE TABLE IF NOT EXISTS `mv_trending_repos`
(
    `dt` DATETIME NOT NULL COMMENT 'The datetime of querying.',
    `language` VARCHAR(30) NOT NULL COMMENT 'The primary language of repository.',
    `period` VARCHAR(30) NOT NULL COMMENT 'The preset time range, for example: past_1_month',
    `repo_id` INT NOT NULL,
    `stars` INT NULL,
    `forks` INT NULL,
    `pull_requests` INT NULL,
    `pushes` INT NULL,
    `total_score` DOUBLE NULL,
    `contributor_logins` VARCHAR(255) NULL,
    PRIMARY KEY (`language`, `period`, `dt`, `repo_id`)
);