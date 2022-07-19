select count(distinct actor_login) as total
from github_events
where repo_id = 41986369 and type = 'WatchEvent';
