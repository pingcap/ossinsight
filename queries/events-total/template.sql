SELECT
    /*+ read_from_storage(tiflash[github_events]) */
    COUNT(*) AS cnt,
    max(created_at) AS latest_created_at,
    UNIX_TIMESTAMP(MAX(created_at)) AS latest_timestamp
FROM github_events;
