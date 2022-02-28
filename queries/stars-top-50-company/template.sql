select *
from (
    select
        trim(replace(replace(replace(replace(replace(replace(replace(replace(u.company, ',', ''), '-', ''), '@', ''), '.', ''), 'ltd', ''), 'inc', ''), 'com', ''), 'www', '')) as company_name,
        count(distinct actor_id) as stargazers
    from github_events_old
    use index(index_github_events_on_repo_name)
    left join users u ON github_events_old.actor_login = u.login
    where repo_name = 'pingcap/tidb' and github_events_old.type = 'WatchEvent'
    group by 1
 ) sub
where length(company_name) != 0 and company_name not in ('-', '--- click here ---', 'none', 'no', 'home', 'n/a')
order by stargazers desc
limit 50;
