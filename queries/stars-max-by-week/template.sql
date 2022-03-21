select max(cnt) as max
from (
    select count(distinct actor_id) as cnt
    from github_events
    use index(index_github_events_on_repo_id)
    where repo_id = 41986369 and type = 'WatchEvent'
    group by date_format(created_at, '%X-%V')
) sub
