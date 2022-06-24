SELECT
    dayofweek(created_at) - 1 as dayofweek,
    hour(created_at) as hour,
    sum(push_distinct_size) as pushes
from github_events 
where type = 'PushEvent' AND actor_login = 'dependabot[bot]' and event_year >= 2019
group by dayofweek, hour
order by dayofweek, hour