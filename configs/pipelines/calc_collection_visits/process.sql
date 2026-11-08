WITH collections_with_past_month_visits AS (
    SELECT
        /*+ READ_FROM_STORAGE(TIFLASH[sar]) */
        JSON_UNQUOTE(JSON_EXTRACT(query, '$.collectionId')) AS collection_id,
        COUNT(*) AS past_month_visit
    FROM stats_api_requests sar
    WHERE
        path LIKE '/q/collection-%'
        AND method = 'GET'
        AND status_code >= 200 AND status_code < 300
        AND error = 0
        AND is_dev = 0
        AND finished_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)
        AND finished_at <= NOW()
        AND JSON_UNQUOTE(JSON_EXTRACT(query, '$.collectionId')) REGEXP '^[1-9][0-9]{0,18}$'
    GROUP BY collection_id
)
UPDATE
    collections c
    -- Compare canonical strings: malformed legacy IDs must not coerce to an ID.
    LEFT JOIN collections_with_past_month_visits cv ON CAST(c.id AS CHAR) = cv.collection_id
SET
    c.past_month_visits = COALESCE(cv.past_month_visit, 0)
;
