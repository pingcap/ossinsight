select
    dayofweek(created_at) - 1 as dayofweek,
    hour(created_at) as hour,
    sum(push_distinct_size) as pushes
from github_events
use index(index_github_events_on_repo_id)
where repo_id in (41986369) and type = 'PushEvent'
group by 1, 2
order by 1, 2
