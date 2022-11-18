CREATE USER IF NOT EXISTS 'executoruser'@'%' IDENTIFIED BY 'executorpassword';
GRANT SELECT ON gharchive_dev.* TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.cache TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.cached_table_cache TO 'executoruser'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON gharchive_dev.access_logs TO 'executoruser'@'%';
GRANT INSERT ON gharchive_dev.sys_users TO 'executoruser'@'%';
GRANT INSERT ON gharchive_dev.stats_query_summary TO 'executoruser'@'%';

CREATE USER IF NOT EXISTS 'webshelluser'@'%' IDENTIFIED BY 'webshellpassword';
GRANT SELECT ON gharchive_dev.* TO 'webshelluser'@'%';

FLUSH PRIVILEGES;
