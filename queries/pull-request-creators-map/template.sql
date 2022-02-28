select upper(u.country_code) as country_or_area, count(distinct github_events_old.actor_id) as count
from github_events_old
use index(index_github_events_on_repo_name)
left join users u on github_events_old.actor_login = u.login
where repo_name = 'pingcap/tidb' and github_events_old.type = 'PullRequestEvent' and u.country_code is not null
group by 1
order by 2;
