with issue_closed as (
    select
        event_month, count(distinct pr_or_issue_id) as closed
    from
        github_events ge
    use index(index_github_events_on_repo_id)
    where
        type = 'IssuesEvent'
        and action = 'closed'
        and repo_id = 41986369
    group by 1
), issue_opened as (
    select
        event_month, count(distinct pr_or_issue_id) as opened
    from
        github_events ge
    use index(index_github_events_on_repo_id)
    where
        type = 'IssuesEvent'
        and action = 'opened'
        and repo_id = 41986369
        -- Exclude Bots
        and actor_login not like '%bot%'
        and actor_login not in (select login from blacklist_users)
    group by 1
)
select
    io.event_month, opened, coalesce(closed, 0) as closed
from
    issue_opened io
    join issue_closed ic on io.event_month = ic.event_month
order by 1
;