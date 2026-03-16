USE gharchive_dev;

with repo AS (
  SELECT repo_id
  FROM github_repos
  WHERE repo_name = CONCAT(${owner}, '/', ${repo})
  LIMIT 1
), issue_with_closed_at as (
    select
        number, DATE_FORMAT(created_at, '%Y-%m-01') AS t_month, created_at as closed_at
    from
        github_events ge
    where
        type = 'IssuesEvent'
        and action = 'closed'
        and repo_id = (SELECT repo_id FROM repo)
        AND created_at >= ${from}
        AND created_at <= ${to} 
), issue_with_opened_at as (
    select
        number, created_at as opened_at
    from
        github_events ge
    where
        type = 'IssuesEvent'
        and action = 'opened'
        -- Exclude Bots
        -- and actor_login not like '%bot%'
        -- and actor_login not in (select login from blacklist_users bu)
        and repo_id = (SELECT repo_id FROM repo)
        AND created_at >= ${from}
        AND created_at <= ${to} 
), tdiff as (
    select
        DATE_FORMAT(t_month, '%Y-%m-01') AS t_month,
        (UNIX_TIMESTAMP(iwc.closed_at) - UNIX_TIMESTAMP(iwo.opened_at)) as diff
    from
        issue_with_opened_at iwo
        join issue_with_closed_at iwc on iwo.number = iwc.number and iwc.closed_at > iwo.opened_at
), tdiff_with_rank as (
    select
        tdiff.t_month,
        diff  / 60 / 60 as diff,
        ROW_NUMBER() over (partition by tdiff.t_month order by diff) as r,
        count(*) over (partition by tdiff.t_month) as cnt,
        first_value(diff / 60 / 60) over (partition by tdiff.t_month order by diff) as p0,
        first_value(diff / 60 / 60)  over (partition by tdiff.t_month order by diff desc) as p100
    from tdiff
), tdiff_p25 as (
    select
        t_month, diff as p25
    from
        tdiff_with_rank tr
    where
        r = round(cnt * 0.25)
), tdiff_p50 as (
    select
        t_month, diff as p50
    from
        tdiff_with_rank tr
    where
        r = round(cnt * 0.5)
), tdiff_p75 as (
    select
        t_month, diff as p75
    from
        tdiff_with_rank tr
    where
        r = round(cnt * 0.75)
)
select
    distinct tr.t_month AS event_month,
    ROUND(p0, 2) AS p0,
    ROUND(p25, 2) AS p25,
    ROUND(p50, 2) AS p50,
    ROUND(p75, 2) AS p75,
    ROUND(p100, 2) AS p100
from tdiff_with_rank tr
left join tdiff_p25 p25 on tr.t_month = p25.t_month
left join tdiff_p50 p50 on tr.t_month = p50.t_month
left join tdiff_p75 p75 on tr.t_month = p75.t_month
order by 1
;