WITH public_collection_items AS (
    SELECT ci.* FROM collection_items ci
    JOIN collections public_collection ON public_collection.id = ci.collection_id
    WHERE public_collection.public = 1
)
SELECT
    c.id, ANY_VALUE(c.name) AS name
FROM
    public_collection_items ci
JOIN collections c ON ci.collection_id = c.id
WHERE
    ci.repo_id = 41986369
GROUP BY c.id;