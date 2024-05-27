INSERT INTO mv_events_total(record_time, events_increment, events_total)
WITH last_record AS (
    SELECT
        /*+ MERGE() */
        record_time AS last_event_time,
        events_total AS last_events_total
    FROM mv_events_total
    WHERE record_time > (NOW() - INTERVAL 12 HOUR)
    ORDER BY record_time DESC
    LIMIT 1
), cte AS (
    SELECT
        MAX(created_at) AS current_max_event_time,
        COUNT(1) AS current_events_total
    FROM github_events
)
SELECT
    current_max_event_time AS record_time,
    current_events_total - COALESCE((SELECT last_events_total FROM last_record), 0) AS events_increment,
    current_events_total AS events_total
FROM
    cte
;