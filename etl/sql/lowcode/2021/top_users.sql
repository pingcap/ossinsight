select
  actor_login, 
  count(*) as pr_count
from github_events
join nocode_repos wf on wf.id = github_events.repo_id
where event_year = 2021 and type = 'PullRequestEvent' and action = 'opened' and actor_login not like '%bot%'
group by 1
order by 2 desc
limit 10
