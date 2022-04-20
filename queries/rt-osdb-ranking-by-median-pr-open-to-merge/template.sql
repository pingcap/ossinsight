with issue_with_merged_at as (
    select
        /*+ read_from_storage(tiflash[ge]) */
        pr_or_issue_id, db.group_name as repo_group_name, created_at as merged_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
        type = 'PullRequestEvent'
        and action = 'closed'
), issue_with_opened_at as (
    select
        /*+ read_from_storage(tiflash[ge]) */
        pr_or_issue_id, db.group_name as repo_group_name, created_at as opened_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
        type = 'PullRequestEvent'
        and action = 'opened'
        and actor_login not like '%bot%'
), tdiff as (
    select
        iwo.repo_group_name,
        (UNIX_TIMESTAMP(iwm.merged_at) - UNIX_TIMESTAMP(iwo.opened_at)) / 60 / 60 / 24 as diff,
        ROW_NUMBER() over (partition by iwo.repo_group_name order by (UNIX_TIMESTAMP(iwm.merged_at) - UNIX_TIMESTAMP(iwo.opened_at))) as r,
        count(*) over (partition by iwo.repo_group_name) as cnt
    from
        issue_with_opened_at iwo
        join issue_with_merged_at iwm on iwo.pr_or_issue_id = iwm.pr_or_issue_id
)
select
    repo_group_name,
    diff as 'days'
from
    tdiff
where
    r = (cnt DIV 2)
order by 2 asc
