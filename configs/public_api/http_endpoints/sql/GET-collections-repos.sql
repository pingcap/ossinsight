USE gharchive_dev;
SELECT ci.repo_id, ci.repo_name
FROM collection_items ci
JOIN collections c ON c.id = ci.collection_id
WHERE ci.collection_id = ${collection_id} AND c.public = 1 AND ci.deleted_at IS NULL;
