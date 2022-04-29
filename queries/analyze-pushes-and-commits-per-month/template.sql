with pushes_group_by_month as (
    select event_month, count(*) as pushes
    from github_events
    use index(index_github_events_on_repo_id)
    where repo_id = 41986369 and type = 'PushEvent'
    group by event_month
    order by event_month
), commits_group_by_month as (
    select event_month, sum(push_distinct_size) as commits
    from github_events
    use index(index_github_events_on_repo_id)
    where repo_id = 41986369 and type = 'PushEvent'
    group by event_month
    order by event_month
)
select
    pm.event_month as event_month,
    pushes,
    commits
from
    pushes_group_by_month pm
    join commits_group_by_month cm on pm.event_month = cm.event_month
order by event_month 
;