USE gharchive_dev;
SELECT repo_id, repo_name
FROM collection_items
WHERE collection_id = ${collection_id}