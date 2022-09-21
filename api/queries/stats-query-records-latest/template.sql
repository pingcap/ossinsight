SELECT
    id, query_name, digest_text, executed_at, UNIX_TIMESTAMP(executed_at) AS ts
FROM
    stats_query_summary
WHERE
    executed_at BETWEEN FROM_UNIXTIME(1663636555) AND UTC_TIMESTAMP
    AND FROM_UNIXTIME(1663636555) > (UTC_TIMESTAMP - INTERVAL 1 DAY)
ORDER BY executed_at DESC
LIMIT 40;