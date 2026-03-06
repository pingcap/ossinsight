CREATE TABLE IF NOT EXISTS t_github_prs (
    id VARCHAR PRIMARY KEY,
    dev_id BIGINT,
    repo_id BIGINT,
    create_time TIMESTAMP WITH TIME ZONE,
    program_language VARCHAR
);

CREATE TABLE IF NOT EXISTS t_year_sum (
    year INT PRIMARY KEY,
    developers BIGINT,
    repositories BIGINT,
    additions BIGINT,
    deletions BIGINT,
);

CREATE TABLE IF NOT EXISTS t_event_daily (
    "day" DATE PRIMARY KEY,
    "pr" BIGINT,
    "open" BIGINT,
    "merge" BIGINT,
    "close" BIGINT,
    "dev" BIGINT,
);

CREATE TABLE IF NOT EXISTS t_developer_id (
    "developer" BIGINT PRIMARY KEY,
    "create_time" TIMESTAMP WITH TIME ZONE,
);

CREATE TABLE IF NOT EXISTS t_repository_id (
    "repository" BIGINT PRIMARY KEY,
    "create_time" TIMESTAMP WITH TIME ZONE,
);

-- CREATE MATERIALIZED VIEW mv_daily_count AS
-- SELECT count(*) AS pr_amount,
--        count(DISTINCT dev_id) AS unique_dev_id_amount,
--        count(DISTINCT repo_id) AS unique_repo_id_amount
-- FROM t_github_prs
-- WHERE create_time >= date_trunc('day', CURRENT_TIMESTAMP);
--
-- CREATE MATERIALIZED VIEW mv_yearly_count AS
-- SELECT count(*) AS pr_amount,
--        count(DISTINCT dev_id) AS unique_dev_id_amount,
--        count(DISTINCT repo_id) AS unique_repo_id_amount
-- FROM t_github_prs
-- WHERE create_time >= date_trunc('year', CURRENT_TIMESTAMP);

CREATE MATERIALIZED VIEW mv_secondly_language_count AS
SELECT program_language, create_time, COUNT(*) AS amount
FROM t_github_prs
WHERE program_language IS NOT NULL
    AND LENGTH(program_language) != 0
GROUP BY program_language, create_time;

CREATE MATERIALIZED VIEW mv_latest_hour_language_count AS
SELECT secondly.program_language, SUM(secondly.amount) AS amount
FROM mv_secondly_language_count AS secondly
WHERE secondly.create_time >= NOW() - INTERVAL '1 hour'
GROUP BY secondly.program_language;
