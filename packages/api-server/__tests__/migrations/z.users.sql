CREATE USER IF NOT EXISTS 'executoruser'@'%' IDENTIFIED BY 'executorpassword';
GRANT SELECT ON gharchive_dev.* TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.cache TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.cached_table_cache TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.access_logs TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.github_repos TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.sys_users TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.sys_accounts TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.sys_subscribed_repos TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.sys_repo_milestones TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.sys_repo_milestone_types TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.sys_sent_repo_milestones TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.stats_query_summary TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.explorer_questions TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.explorer_recommend_questions TO 'executoruser'@'%';

CREATE USER IF NOT EXISTS 'webshelluser'@'%' IDENTIFIED BY 'webshellpassword';
GRANT SELECT ON gharchive_dev.* TO 'webshelluser'@'%';

FLUSH PRIVILEGES;
