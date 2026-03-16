INSERT INTO mv_events_total(record_time, events_increment, events_total)
WITH last_record AS (
    SELECT
        /*+ MERGE() */
        record_time AS last_event_time,
        events_total AS last_events_total
    FROM mv_events_total
    WHERE record_time > (NOW() - INTERVAL 1 HOUR)
    ORDER BY record_time DESC
    LIMIT 1
), inc_events AS (
    SELECT
        MAX(created_at) AS current_max_event_time,
        COUNT(1) AS inc_events
    FROM github_events ge
    WHERE
        created_at >= (SELECT last_event_time FROM last_record)
)
SELECT
    current_max_event_time AS record_time,
    inc_events AS new_events_increment,
    inc_events + (SELECT last_events_total FROM last_record) AS new_events_total
FROM
    inc_events
WHERE
    EXISTS(SELECT * FROM last_record)
ON DUPLICATE KEY UPDATE
    events_increment = VALUES(events_increment),
    events_total = VALUES(events_total)