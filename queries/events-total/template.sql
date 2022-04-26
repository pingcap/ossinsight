SELECT
    /*+ read_from_storage(tiflash[github_events]) */
    COUNT(*) AS cnt
FROM github_events;
