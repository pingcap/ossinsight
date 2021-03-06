with issue_with_closed_at as (
    select
        pr_or_issue_id, db.group_name as repo_group_name, created_at as closed_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
        type = 'IssuesEvent'
        and action = 'closed'
), issue_with_opened_at as (
    select
        pr_or_issue_id, db.group_name as repo_group_name, created_at as opened_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
        type = 'IssuesEvent'
        and action = 'opened'
        and actor_login not like '%bot%' and actor_login != 'cockroach-teamcity'
), tdiff as (
    select
        iwo.repo_group_name,
        (UNIX_TIMESTAMP(iwc.closed_at) - UNIX_TIMESTAMP(iwo.opened_at)) / 60 / 60 / 24 as diff
    from
        issue_with_opened_at iwo
        join issue_with_closed_at iwc on iwo.pr_or_issue_id = iwc.pr_or_issue_id
), trank as (
    select
        repo_group_name,
        diff,
        ROW_NUMBER() over (partition by repo_group_name order by diff) as r,
        count(*) over (partition by repo_group_name) as cnt
    from
        tdiff
    where
        diff > 0.1
)
select
    repo_group_name,
    diff as 'days'
from
    trank
where
    r = (cnt DIV 2)
order by 2 asc
