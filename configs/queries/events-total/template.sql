SELECT
    COUNT(1) AS cnt,
    MAX(created_at) AS latest_created_at,
    UNIX_TIMESTAMP(MAX(created_at)) AS latest_timestamp
FROM github_events;
