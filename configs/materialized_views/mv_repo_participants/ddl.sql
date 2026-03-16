CREATE TABLE IF NOT EXISTS `mv_repo_participants`
(
    `repo_id` INT(11) NOT NULL,
    `user_login` VARCHAR(40) NOT NULL,
    `first_engagement_at` DATETIME,
    `last_engagement_at` DATETIME,
    PRIMARY KEY (`repo_id`, `user_login`),
    KEY idx_mrp_repo_id_first_engagement_at(`repo_id`, `first_engagement_at`, `user_login`),
    KEY idx_mrp_repo_id_last_engagement_at(`repo_id`, `last_engagement_at`, `user_login`)
);