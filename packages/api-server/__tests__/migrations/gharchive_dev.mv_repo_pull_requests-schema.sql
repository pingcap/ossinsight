CREATE TABLE IF NOT EXISTS `mv_repo_pull_requests`
(
    `repo_id` INT(11),
    `number` INT(11),
    PRIMARY KEY (`repo_id`, `number`)
);
