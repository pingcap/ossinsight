with issue_with_first_responed_at as (
    select
        number, min(date_format(created_at, '%Y-%m-01')) as event_month, min(created_at) as first_responed_at
    from
        github_events ge
    where
        repo_id = 41986369
        and ((type = 'IssueCommentEvent' and action = 'created') or (type = 'IssuesEvent' and action = 'closed'))
        -- Exclude Bots
        -- and actor_login not like '%bot%'
        -- and actor_login not in (select login from blacklist_users bu)
    group by 1
), issue_with_opened_at as (
    select
        number, created_at as opened_at
    from
        github_events ge
    where
        repo_id = 41986369
        and type = 'IssuesEvent'
        and action = 'opened'
        -- Exclude Bots
        -- and actor_login not like '%bot%'
        -- and actor_login not in (select login from blacklist_users bu)
), tdiff as (
    select
        event_month,
        (UNIX_TIMESTAMP(iwfr.first_responed_at) - UNIX_TIMESTAMP(iwo.opened_at)) as diff
    from
        issue_with_opened_at iwo
        join issue_with_first_responed_at iwfr on iwo.number = iwfr.number and iwfr.first_responed_at > iwo.opened_at
), tdiff_with_rank as (
    select
        tdiff.event_month,
        diff  / 60 / 60 as diff,
        ROW_NUMBER() over (partition by tdiff.event_month order by diff) as r,
        count(*) over (partition by tdiff.event_month) as cnt,
        first_value(diff / 60 / 60) over (partition by tdiff.event_month order by diff) as p0,
        first_value(diff / 60 / 60)  over (partition by tdiff.event_month order by diff desc) as p100
    from tdiff
), tdiff_p25 as (
    select
        event_month, diff as p25
    from
        tdiff_with_rank tr
    where
        r = round(cnt * 0.25)
), tdiff_p50 as (
    select
        event_month, diff as p50
    from
        tdiff_with_rank tr
    where
        r = round(cnt * 0.5)
), tdiff_p75 as (
    select
        event_month, diff as p75
    from
        tdiff_with_rank tr
    where
        r = round(cnt * 0.75)
)
select
    distinct tr.event_month,
    p0,
    p25,
    p50,
    p75,
    p100
from tdiff_with_rank tr
left join tdiff_p25 p25 on tr.event_month = p25.event_month
left join tdiff_p50 p50 on tr.event_month = p50.event_month
left join tdiff_p75 p75 on tr.event_month = p75.event_month
order by 1
;
