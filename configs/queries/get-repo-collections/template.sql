SELECT
    c.id, ANY_VALUE(c.name) AS name
FROM
    collection_items ci
JOIN collections c ON ci.collection_id = c.id
WHERE
    ci.repo_id = 41986369
GROUP BY c.id;