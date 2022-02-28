select max(cnt) as max
from (
    select count(distinct actor_id) as cnt
    from github_events_old
    use index(index_github_events_on_repo_name)
    where repo_name = 'pingcap/tidb' and type = 'WatchEvent'
    group by date_format(created_at, '%X-%V')
) sub
