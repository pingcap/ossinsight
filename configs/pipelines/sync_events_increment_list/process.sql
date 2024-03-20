WITH collections_with_past_month_visits AS (
    SELECT
        /*+ READ_FROM_STORAGE(TIFLASH[sar]) */
        CAST(JSON_EXTRACT(query, '$.collectionId') AS SIGNED) AS collection_id,
        COUNT(*) AS past_month_visit
    FROM stats_api_requests sar
    WHERE
        path LIKE '/q/collection-%'
        AND finished_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)
    GROUP BY collection_id
)
UPDATE
    collections c, collections_with_past_month_visits cv
SET
    c.past_month_visits = cv.past_month_visit
WHERE
    c.id = cv.collection_id
;