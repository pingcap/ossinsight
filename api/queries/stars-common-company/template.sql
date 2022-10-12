select
    company_name
from (
     select
        trim(replace(replace(replace(replace(replace(replace(replace(replace(gu.organization, ',', ''), '-', ''), '@', ''), 'www.', ''), 'inc', ''), '.com', ''), '.cn', ''), '.', '')) as company_name,
        repo_id,
        count(distinct actor_login) as stargazers
     from github_events ge
     left join github_users gu ON ge.actor_login = gu.login
     where repo_id IN (48833910, 156018) and ge.type = 'WatchEvent'
     group by 1, 2
) sub
where
    length(company_name) != 0
    and company_name not in ('-', 'none', 'no', 'home', 'n/a', 'null', 'unknown')
group by 1
having COUNT(distinct repo_id) > 1
order by SUM(stargazers) desc
limit 50;
