USE gharchive_dev;
WITH collectionsOrderByVisits AS (
	SELECT
        /*+ READ_FROM_STORAGE(tiflash[sar]) */
		CAST(JSON_EXTRACT(query, '$.collectionId') AS SIGNED) AS collection_id,
		COUNT(*) AS visits
	FROM stats_api_requests sar
	WHERE
		path LIKE '/q/collection-%'
        AND finished_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)
	GROUP BY collection_id
	ORDER BY visits DESC
    LIMIT 20
), top10collections AS (
	SELECT c.id, c.name, cv.visits
	FROM collectionsOrderByVisits cv
	JOIN collections c ON cv.collection_id = c.id
)
SELECT
  id, name, repos, repo_id, repo_name, repo_current_period_rank, repo_past_period_rank, repo_rank_changes
FROM (
	SELECT
		tc.id,
		tc.name,
		tc.visits,
        COUNT(*) OVER (PARTITION BY ci.collection_id) AS repos,
		ci.repo_id,
		ci.repo_name,
		ROW_NUMBER() OVER (PARTITION BY ci.collection_id ORDER BY IFNULL(ci.last_month_rank, 999999)) AS `rank`,
		ci.last_month_rank AS repo_current_period_rank,
		ci.last_2nd_month_rank AS repo_past_period_rank,
		(ci.last_2nd_month_rank - ci.last_month_rank) AS repo_rank_changes
	FROM collection_items ci
	JOIN top10collections tc ON ci.collection_id = tc.id
) sub
WHERE `rank` <= 3
ORDER BY visits DESC;
