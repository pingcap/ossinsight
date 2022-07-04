select actor_id AS id, 'Mini256' AS login from github_events where actor_login = 'Mini256' AND actor_id IS NOT NULL limit 1;
