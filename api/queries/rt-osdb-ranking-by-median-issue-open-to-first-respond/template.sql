with issue_with_first_responed_at as (
    select
        pr_or_issue_id, any_value(db.group_name) as repo_group_name, min(created_at) as first_responed_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
        ((type = 'IssueCommentEvent' and action = 'created') or (type = 'IssuesEvent' and action = 'closed'))
        and actor_login not like '%bot%'
        and actor_login != 'elasticmachine'
    group by 1
), issue_with_opened_at as (
    select
        pr_or_issue_id, db.group_name as repo_group_name, created_at as opened_at
    from
        github_events ge
        join osdb_repos db on ge.repo_id = db.id
    where
        type = 'IssuesEvent'
        and action = 'opened'
), tdiff as (
    select
        iwo.repo_group_name,
        (UNIX_TIMESTAMP(iwfr.first_responed_at) - UNIX_TIMESTAMP(iwo.opened_at)) / 60 / 60 / 24 as diff,
        ROW_NUMBER() over (partition by iwo.repo_group_name order by (UNIX_TIMESTAMP(iwfr.first_responed_at) - UNIX_TIMESTAMP(iwo.opened_at))) as r,
        count(*) over (partition by iwo.repo_group_name) as cnt
    from
        issue_with_opened_at iwo
        join issue_with_first_responed_at iwfr on iwo.pr_or_issue_id = iwfr.pr_or_issue_id
)
select
    repo_group_name,
    diff as 'days'
from
    tdiff
where
    r = (cnt DIV 2)
order by 2 asc
