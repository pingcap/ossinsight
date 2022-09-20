SELECT
    table_name AS tableName,
    index_name AS indexName,
    COUNT(DISTINCT digest) AS queries,
    SUM(exec_count) AS calls
FROM stats_index_summary sis
WHERE
    summary_begin_time >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-%d 00:00:00')
    AND summary_end_time <= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-%d 23:59:59')
GROUP BY table_name, index_name
ORDER BY calls DESC