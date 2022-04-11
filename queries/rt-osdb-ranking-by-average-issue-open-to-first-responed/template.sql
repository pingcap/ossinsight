with issue_with_first_responed_at as (
    select
        /*+ read_from_storage(tiflash[ge]) */
        pr_or_issue_id, any_value(db.group_name) as repo_group_name, min(created_at) as first_responed_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
            type = 'IssueCommentEvent'
      and action = 'created'
    group by 1
), issue_with_opened_at as (
    select
        /*+ read_from_storage(tiflash[ge]) */
        db.group_name as repo_group_name, pr_or_issue_id, created_at as opened_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
            type = 'IssuesEvent'
      and action = 'opened'
)
select
    iwo.repo_group_name,
    avg(UNIX_TIMESTAMP(iwfr.first_responed_at) - UNIX_TIMESTAMP(iwo.opened_at)) / 60 / 60 / 24 as 'days'
from
    issue_with_opened_at iwo
    join issue_with_first_responed_at iwfr on iwo.pr_or_issue_id = iwfr.pr_or_issue_id
group by 1
order by 2 asc
