SELECT
    id, query_name, SUBSTRING(digest_text, 1, 200) AS digest_text, executed_at
FROM
    stats_query_summary
ORDER BY executed_at DESC
LIMIT 100;