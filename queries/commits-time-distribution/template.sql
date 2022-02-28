select
    dayofweek(created_at) - 1 as dayofweek,
    hour(created_at) as hour,
    sum(push_distinct_size) as pushes
from github_events_old
use index(index_github_events_on_repo_name)
where repo_name = 'pingcap/tidb' and type = 'PushEvent'
group by 1, 2
order by 1, 2
