CREATE TABLE IF NOT EXISTS `mv_events_increment_list`
(
    `id` BIGINT(20) NOT NULL DEFAULT '0',
    `type` VARCHAR(29) NOT NULL DEFAULT 'Event',
    `repo_id` BIGINT(20) NOT NULL DEFAULT '0',
    `repo_name` VARCHAR(140) NOT NULL DEFAULT '',
    `actor_id` BIGINT(20) NOT NULL DEFAULT '0',
    `actor_login` VARCHAR(40) NOT NULL DEFAULT '',
    `number` INT(11) NOT NULL DEFAULT '0',
    `pr_merged` TINYINT(1) NOT NULL DEFAULT '0',
    `created_at` DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY (`id`),
    KEY idx_meil_on_created_at (`created_at`)
);
