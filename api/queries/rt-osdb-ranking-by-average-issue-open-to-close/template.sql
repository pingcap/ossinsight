with issue_with_closed_at as (
    select
        /*+ read_from_storage(tiflash[ge]) */
        pr_or_issue_id, db.group_name as repo_group_name, created_at as closed_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
        type = 'IssuesEvent'
        and action = 'closed'
), issue_with_opened_at as (
    select
        /*+ read_from_storage(tiflash[ge]) */
        pr_or_issue_id, db.group_name as repo_group_name, created_at as opened_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
        type = 'IssuesEvent'
        and action = 'opened'
)
select
    iwo.repo_group_name,
    avg(UNIX_TIMESTAMP(iwc.closed_at) - UNIX_TIMESTAMP(iwo.opened_at)) / 60 / 60 / 24 as 'days'
from
    issue_with_opened_at iwo
    join issue_with_closed_at iwc on iwo.pr_or_issue_id = iwc.pr_or_issue_id
group by 1
order by 2 asc
