CREATE TABLE IF NOT EXISTS `mv_repo_daily_engagements`
(
    `repo_id` INT(11) NOT NULL,
    `user_login` INT(11)  NOT NULL,
    `day` DATE,
    `engagements` INT(11),
    PRIMARY KEY (`repo_id`, `user_login`),
    UNIQUE KEY `idx_mrde_on_repo_id_day_user_login` (`repo_id`,`day`,`user_login`)
);
