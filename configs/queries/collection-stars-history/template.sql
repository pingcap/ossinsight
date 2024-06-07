WITH accumulative_stars_by_month AS (
    SELECT
        repo_id,
        month,
        stars AS total
    FROM mv_repo_monthly_summary mrms
    WHERE
        repo_id IN (SELECT repo_id FROM collection_items ci WHERE collection_id = 10001)
)
SELECT
    ci.repo_id AS repo_id,
    ci.repo_name AS repo_name,
    acc.month AS event_month,
    acc.total
FROM accumulative_stars_by_month acc
JOIN collection_items ci ON collection_id = 10001 AND ci.repo_id = acc.repo_id
ORDER BY repo_id, month
;
