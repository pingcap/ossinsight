select *
from (
    select
        trim(replace(replace(replace(replace(replace(replace(replace(replace(lower(u.company), ',', ''), '-', ''), '@', ''), '.', ''), 'ltd', ''), 'inc', ''), 'com', ''), 'www', '')) as company_name,
        count(distinct actor_id) as stargazers
    from github_events
    use index(index_github_events_on_repo_id)
    left join users u ON github_events.actor_login = u.login
    where repo_id in (41986369) and github_events.type = 'WatchEvent'
    group by 1
 ) sub
where length(company_name) != 0 and company_name not in ('-', '--- click here ---', 'none', 'no', 'home', 'n/a', 'unknown', 'null')
order by stargazers desc
limit 9999999999;
