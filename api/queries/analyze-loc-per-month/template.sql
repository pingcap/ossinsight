select
    event_month,
    sum(additions) as additions,
    sum(deletions) as deletions,
    sum(additions) - sum(deletions) as net_additions,
    sum(additions) + sum(deletions) as changes
from github_events
use index(index_github_events_on_repo_id)
where
    repo_id = 41986369
    and type = 'PullRequestEvent'
    and action = 'closed'
    and pr_merged = true
group by event_month
order by event_month
;