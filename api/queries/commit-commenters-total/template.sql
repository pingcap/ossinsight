select count(distinct actor_id)
from github_events
where repo_id = 41986369 and type = 'CommitCommentEvent';
