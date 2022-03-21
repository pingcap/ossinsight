select sum(push_distinct_size) from github_events
use index(index_github_events_on_repo_id)
where repo_id = 41986369 and type = 'PushEvent';
