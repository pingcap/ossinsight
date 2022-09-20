SELECT
    id, query_name, SUBSTRING(digest_text, 1, 200) AS digest_text, executed_at
FROM
    stats_query_summary
WHERE
    executed_at BETWEEN FROM_UNIXTIME(1663636555) AND UTC_TIMESTAMP
    AND FROM_UNIXTIME(1663636555) > (UTC_TIMESTAMP - INTERVAL 1 DAY)
ORDER BY executed_at DESC
LIMIT 100;