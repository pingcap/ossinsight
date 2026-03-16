SELECT
    actor_id AS id, 'Mini256' AS login
FROM github_events
WHERE
    actor_login = 'Mini256'
    AND actor_id IS NOT NULL  -- TODO: remove
    AND actor_id != 0
LIMIT 1;