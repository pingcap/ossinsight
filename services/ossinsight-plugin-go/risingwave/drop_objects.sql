DROP MATERIALIZED VIEW IF EXISTS mv_latest_hour_language_count;
DROP MATERIALIZED VIEW IF EXISTS mv_secondly_language_count;

DROP TABLE IF EXISTS t_repository_id;
DROP TABLE IF EXISTS t_developer_id;
DROP TABLE IF EXISTS t_event_daily;
DROP TABLE IF EXISTS t_year_sum;
DROP TABLE IF EXISTS t_github_prs;