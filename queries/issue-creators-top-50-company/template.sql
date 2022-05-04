select *
from (
     select
         trim(replace(replace(replace(replace(replace(replace(replace(replace(lower(u.company), ',', ''), '-', ''), '@', ''), 'www.', ''), 'inc', ''), '.com', ''), '.cn', ''), '.', '')) as company_name,
         count(distinct github_events.actor_id) as issue_creators
     from github_events
     use index(index_github_events_on_repo_id)
     left join users u ON github_events.actor_login = u.login
     where repo_id in (41986369) and github_events.type = 'IssuesEvent' and action = 'opened'
     group by 1
) sub
where length(company_name) != 0 and company_name not in ('-', 'none', 'no', 'home', 'n/a', 'null', 'unknown')
order by issue_creators desc
limit 9999999999;
