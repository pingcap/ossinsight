SELECT
    COUNT(1) AS cnt,
    MAX(created_at) AS latest_created_at,
    UNIX_TIMESTAMP(MAX(created_at)) AS latest_timestamp
FROM github_events
WHERE
    created_at BETWEEN FROM_UNIXTIME(1653944647) AND (UTC_TIMESTAMP - INTERVAL 5 MINUTE)
    AND FROM_UNIXTIME(1653944647) > (UTC_TIMESTAMP - INTERVAL 2 HOUR);