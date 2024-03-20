CREATE TABLE IF NOT EXISTS `mv_events_increment_intervals`
(
    `record_time` DATETIME,
    `interval` INT(11),
    PRIMARY KEY (`record_time`)
);
