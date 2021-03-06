select
    upper(u.country_code) as country_or_area,
    count(distinct github_events.actor_id) as count,
    count(distinct github_events.actor_id) / max(s.total) as percentage
from github_events
left join users_refined u on github_events.actor_login = u.login
join (
    -- Get the number of people has the country code.
    select count(distinct github_events.actor_id) as total
    from github_events
    left join users_refined u ON github_events.actor_login = u.login
    where repo_id in (41986369) and github_events.type = 'PullRequestEvent' and u.country_code is not null
) s
where repo_id in (41986369) and github_events.type = 'PullRequestEvent' and action = 'opened' and u.country_code is not null
group by 1
order by 2 desc;
