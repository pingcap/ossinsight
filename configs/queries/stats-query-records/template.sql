SELECT
    id, query_name, digest_text, executed_at, UNIX_TIMESTAMP(executed_at) AS ts
FROM
    stats_query_summary
ORDER BY executed_at DESC
LIMIT 40;