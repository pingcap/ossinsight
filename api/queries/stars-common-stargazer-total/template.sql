select
    count(distinct actor_login)
from (
    select
        actor_login,
        count(distinct repo_id) repos
    from github_events
    use index(index_github_events_on_repo_id)
    left join users u ON github_events.actor_login = u.login
    where repo_id IN (48833910, 156018) and github_events.type = 'WatchEvent'
    group by 1
) sub
where repos > 1
