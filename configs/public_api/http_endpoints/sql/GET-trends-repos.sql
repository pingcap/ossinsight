USE gharchive_dev;

WITH repos AS (
  SELECT
    tr.repo_id,
    gr.repo_name,
    gr.primary_language,
    gr.description,
    tr.stars,
    tr.forks,
    tr.pull_requests,
    tr.pushes,
    tr.total_score,
    tr.contributor_logins
  FROM mv_trending_repos tr
  JOIN github_repos gr ON tr.repo_id = gr.repo_id
  WHERE
    -- Filter by the primary language of repository.
    language = ${language}
    -- Filter by the period of trend querying.
    AND period = ${period}
    AND dt = (
      -- Get the latest querying datetime.
      SELECT dt
      FROM mv_trending_repos
      WHERE language = ${language} AND period = ${period}
      ORDER BY dt DESC
      LIMIT 1
    )
), repo_with_collections AS (
  SELECT
    r.repo_id, GROUP_CONCAT(DISTINCT c.name) AS collection_names
  FROM repos r
  JOIN collection_items ci ON ci.repo_id = r.repo_id
  JOIN collections c ON ci.collection_id = c.id
  WHERE c.public = true
  GROUP BY r.repo_id
)
SELECT
  r.*,
  rc.collection_names
FROM repos r
LEFT JOIN repo_with_collections rc ON r.repo_id = rc.repo_id
ORDER BY total_score DESC