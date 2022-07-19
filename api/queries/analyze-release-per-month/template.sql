select 
    event_month, count(*) as releases
from github_events
where repo_id = 41986369 and type = 'ReleaseEvent'
group by event_month
order by event_month
;