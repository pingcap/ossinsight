WITH top_10_collections AS (
	SELECT c.id, c.name, c.past_month_visits
	FROM collections c
	ORDER BY c.past_month_visits DESC
	LIMIT 10
)
SELECT *
FROM (
	SELECT
		tc.id,
		tc.name,
		tc.past_month_visits AS visits,
		ci.repo_id,
		ci.repo_name,
		ROW_NUMBER() OVER (PARTITION BY ci.collection_id ORDER BY IFNULL(ci.last_month_rank, 999999)) AS `rank`,
		ci.last_month_rank,
		ci.last_2nd_month_rank,
		(ci.last_2nd_month_rank - ci.last_month_rank) AS rank_changes,
		COUNT(*) OVER (PARTITION BY ci.collection_id) AS repos
	FROM collection_items ci
	JOIN top_10_collections tc ON ci.collection_id = tc.id
) sub
WHERE `rank` <= 3
ORDER BY visits DESC;
