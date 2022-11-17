CREATE USER 'executoruser'@'%' IDENTIFIED BY 'executorpassword';
GRANT SELECT ON gharchive_dev.* TO 'executoruser'@'%';
GRANT INSERT ON gharchive_dev.sys_users TO 'executoruser'@'%';
GRANT INSERT ON gharchive_dev.stats_query_summary TO 'executoruser'@'%';

CREATE USER 'webshelluser'@'%' IDENTIFIED BY 'webshellpassword';
GRANT SELECT ON gharchive_dev.* TO 'webshelluser'@'%';

FLUSH PRIVILEGES;
