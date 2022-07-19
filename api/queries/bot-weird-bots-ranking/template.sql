SELECT 
    actor_id, ANY_VALUE(actor_login) AS actor_login, COUNT(*) AS contributions
FROM github_events ge
WHERE
    type = 'PushEvent'
    AND event_year = 2022
    AND actor_login NOT LIKE '%[bot]'
    AND actor_login NOT LIKE '%bot'
    AND actor_login NOT IN ('fqnssg3847', 'gzwqvg3179', 'znyt')
GROUP BY actor_id
ORDER BY contributions DESC
LIMIT 20