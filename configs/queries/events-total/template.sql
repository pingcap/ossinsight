SELECT
    events_total AS cnt,
    MAX(record_time) AS latest_created_at,
    UNIX_TIMESTAMP(MAX(record_time)) AS latest_timestamp
FROM mv_events_total
WHERE record_time >= NOW() - INTERVAL 12 HOUR
ORDER BY record_time DESC
LIMIT 1;