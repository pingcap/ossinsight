CREATE TABLE IF NOT EXISTS `mv_events_total`
(
    `record_time` DATETIME,
    `events_increment` BIGINT(20),
    `events_total` BIGINT(20),
    PRIMARY KEY (`record_time`)
);
