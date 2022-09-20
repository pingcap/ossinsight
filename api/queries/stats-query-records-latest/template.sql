SELECT
    id, query_name, SUBSTRING(digest_text, 1, 200) AS digest_text, executed_at
FROM
    stats_query_summary
WHERE id > 9999
ORDER BY id DESC
LIMIT 100;