with prs as (
    select
        pr_or_issue_id, db.group_name as repo_group_name, actor_login
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
            type = 'PullRequestEvent'
      and action = 'opened'
)
select
    repo_group_name,
    actor_login as 'contributor',
    count(pr_or_issue_id) as 'prs'
from
    prs
where actor_login not like '%bot%'
group by 1, 2
order by 1, 3 desc
