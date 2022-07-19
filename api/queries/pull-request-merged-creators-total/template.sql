with pr_with_merged_at as (
    select distinct pr_or_issue_id
    from github_events
    where repo_id = 41986369 and type = 'PullRequestEvent' and action = 'closed' and pr_merged = true
)
select count(distinct actor_id)
from github_events ge
join pr_with_merged_at prm on ge.pr_or_issue_id = prm.pr_or_issue_id
where repo_id = 41986369 and type = 'PullRequestEvent' and action = 'opened';
