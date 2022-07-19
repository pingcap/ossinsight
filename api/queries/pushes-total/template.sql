select count(*)
from github_events
where repo_id = 41986369 and type = 'PushEvent';
