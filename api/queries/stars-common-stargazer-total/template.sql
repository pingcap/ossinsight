select
    count(distinct actor_login)
from (
    select
        actor_login,
        count(distinct repo_id) repos
    from github_events ge
    left join github_users gu ON ge.actor_login = gu.login
    where repo_id IN (48833910, 156018) and ge.type = 'WatchEvent'
    group by 1
) sub
where repos > 1
