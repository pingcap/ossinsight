USE gharchive_dev;
SELECT repo_id, repo_name, collection_id
FROM collection_items
WHERE collection_id = ${collection_id}