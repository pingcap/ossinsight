select
    company_name
from (
     select
         trim(replace(replace(replace(replace(replace(replace(replace(replace(lower(u.company), ',', ''), '-', ''), '@', ''), 'www.', ''), 'inc', ''), '.com', ''), '.cn', ''), '.', '')) as company_name,
         repo_id,
         count(distinct actor_id) as stargazers
     from github_events
     use index(index_github_events_on_repo_id)
     left join users u ON github_events.actor_login = u.login
     where repo_id IN (48833910, 156018) and github_events.type = 'WatchEvent'
     group by 1, 2
) sub
where length(company_name) != 0 and company_name not in ('-', 'none', 'no', 'home', 'n/a', 'null')
group by 1
having COUNT(distinct repo_id) > 1
order by SUM(stargazers) desc
limit 50;
