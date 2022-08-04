select
    event_month,
    ifnull(count(*), 0) as pushes,
    sum(coalesce(push_distinct_size, push_size, 0)) as commits
from github_events
where repo_id = 41986369 and type = 'PushEvent'
group by event_month
order by event_month;