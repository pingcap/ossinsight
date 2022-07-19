select 
    created_at
from github_events
where repo_id = 41986369 and type = 'ReleaseEvent'
order by created_at;