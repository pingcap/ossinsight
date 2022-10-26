select
  language, 
  count(*)
from github_events
join web_framework_repos wf on wf.id = github_events.repo_id
where event_year = 2021 and type = 'PullRequestEvent' and action = 'opened'
group by 1
order by 2 desc
limit 5
