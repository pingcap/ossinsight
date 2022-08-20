with issue_closed as (
    select
        date_format(created_at, '%Y-%m-01') as event_month, count(number) as closed
    from
        github_events ge
    where
        type = 'IssuesEvent'
        and action = 'closed'
        and repo_id = 41986369
    group by 1
), issue_opened as (
    select
        date_format(created_at, '%Y-%m-01') as event_month, count(number) as opened
    from
        github_events ge
    where
        type = 'IssuesEvent'
        and action = 'opened'
        and repo_id = 41986369
    group by 1
)
select
    io.event_month, opened, coalesce(closed, 0) as closed
from
    issue_opened io
    join issue_closed ic on io.event_month = ic.event_month
order by event_month
;
