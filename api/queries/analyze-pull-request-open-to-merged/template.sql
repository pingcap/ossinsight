with pr_with_merged_at as (
    select
        number, date_format(created_at, '%Y-%m-01') as event_month, created_at as merged_at
    from
        github_events ge
    where
        type = 'PullRequestEvent'
        -- Considering that some repositoies accept the code of the contributor by closing the PR and push commit directly,
        -- here is not distinguished whether it is the merged event.
        -- See: https://github.com/mongodb/mongo/pulls?q=is%3Apr+is%3Aclosed
        and action = 'closed'
        and repo_id = 41986369
), pr_with_opened_at as (
    select
        number, created_at as opened_at
    from
        github_events ge
    where
        type = 'PullRequestEvent'
        and action = 'opened'
        -- Exclude Bots
        -- and actor_login not like '%bot%'
        -- and actor_login not in (SELECT login FROM blacklist_users bu)
        and repo_id = 41986369
), tdiff as (
    select
        event_month,
        (UNIX_TIMESTAMP(pwm.merged_at) - UNIX_TIMESTAMP(pwo.opened_at)) as diff
    from
        pr_with_opened_at pwo
        join pr_with_merged_at pwm on pwo.number = pwm.number and pwm.merged_at > pwo.opened_at
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

