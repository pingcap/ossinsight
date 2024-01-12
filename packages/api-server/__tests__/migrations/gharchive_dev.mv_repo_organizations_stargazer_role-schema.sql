CREATE TABLE IF NOT EXISTS `mv_repo_organizations_stargazer_role`
(
    `repo_id` INT(11),
    `org_name` VARCHAR(255) NOT NULL,
    `first_seen_at` DATE NOT NULL,
    PRIMARY KEY (`repo_id`, `org_name`),
    KEY idx_mro_sr_on_repo_id_first_seen_at(`repo_id`, `first_seen_at`)
);
