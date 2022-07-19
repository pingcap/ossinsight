select avg(cnt) as avg
from (
    select count(distinct actor_login) as cnt
    from github_events
    where repo_id = 41986369 and type = 'WatchEvent'
    group by date_format(created_at, '%X-%V')
 ) sub;
