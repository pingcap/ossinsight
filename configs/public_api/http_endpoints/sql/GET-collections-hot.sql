USE gharchive_dev;
WITH top_20_collections AS (
	SELECT c.id, c.name, c.past_month_visits
	FROM collections c
	ORDER BY c.past_month_visits DESC
	LIMIT 20
)
SELECT
  id, name, repos, repo_id, repo_name, repo_current_period_rank, repo_past_period_rank, repo_rank_changes
FROM (
	SELECT
		tc.id,
		tc.name,
		tc.past_month_visits AS visits,
        COUNT(*) OVER (PARTITION BY ci.collection_id) AS repos,
		ci.repo_id,
		ci.repo_name,
		ROW_NUMBER() OVER (PARTITION BY ci.collection_id ORDER BY IFNULL(ci.last_month_rank, 999999)) AS `rank`,
		ci.last_month_rank AS repo_current_period_rank,
		ci.last_2nd_month_rank AS repo_past_period_rank,
		(ci.last_2nd_month_rank - ci.last_month_rank) AS repo_rank_changes
	FROM collection_items ci
	JOIN top_20_collections tc ON ci.collection_id = tc.id
) sub
WHERE `rank` <= 3
ORDER BY visits DESC;
