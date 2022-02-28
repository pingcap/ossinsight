select *
from (
    select
        trim(replace(replace(replace(replace(replace(replace(replace(replace(u.company, ',', ''), '-', ''), '@', ''), '.', ''), 'none', ''), 'inc', ''), 'com', ''), 'www', '')) as company_name,
        count(distinct github_events_old.actor_id) as code_contributors
    from github_events_old
    use index(index_github_events_on_repo_name)
    left join users u ON github_events_old.actor_login = u.login
    where repo_name = 'pingcap/tidb' and github_events_old.type = 'PullRequestEvent'
    group by 1
) sub
where length(company_name) != 0 and company_name not in ('-', '--- click here ---', 'none', 'no', 'home', 'n/a')
order by code_contributors desc
limit 50;
