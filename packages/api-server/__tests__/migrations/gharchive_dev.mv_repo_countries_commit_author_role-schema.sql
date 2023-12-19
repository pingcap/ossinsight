CREATE TABLE IF NOT EXISTS `mv_repo_countries_commit_author_role`
(
    `repo_id` INT(11),
    `country_code` CHAR(3),
    `first_seen_at` DATE NOT NULL,
    PRIMARY KEY (`repo_id`, `country_code`),
    KEY idx_mrc_car_on_repo_id_first_seen_at(`repo_id`, `first_seen_at`)
);
