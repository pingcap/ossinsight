with datetime_range as (
    select
        date_format(date_sub(end_import_at, interval 1 hour), '%Y-%m-%d %H:00:00') as t_from,
        date_format(date_sub(end_import_at, interval 1 hour), '%Y-%m-%d %H:59:59') as t_to
    from import_logs
    where end_import_at is not null
    order by end_import_at desc
    limit 1
)
select
    type, count(*) as cnt
from github_events ge
where
    created_at > (select t_from from datetime_range)
    and created_at < (select t_to from datetime_range)
group by type
union
select
    'All' as type, count(*) as cnt
from github_events ge
where
    created_at > (select t_from from datetime_range)
    and created_at < (select t_to from datetime_range)