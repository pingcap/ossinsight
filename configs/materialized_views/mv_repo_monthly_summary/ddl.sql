CREATE TABLE IF NOT EXISTS `mv_repo_monthly_summary`
(
    `repo_id` INT(11),
    `month` DATE,
    `stars` INT(11),
    `pull_requests` INT(11),
    `pull_request_creators` INT(11),
    `issues` INT(11),
    `issue_creators` INT(11),
    PRIMARY KEY (`repo_id`, `month`)
);