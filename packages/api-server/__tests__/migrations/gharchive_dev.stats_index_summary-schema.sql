/*!40101 SET NAMES binary*/;
CREATE TABLE `stats_index_summary` (
  `summary_begin_time` timestamp NOT NULL,
  `summary_end_time` timestamp NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `index_name` varchar(64) NOT NULL,
  `digest` varchar(64) NOT NULL,
  `plan_digest` varchar(64) NOT NULL,
  `exec_count` bigint(20) unsigned DEFAULT '0',
  UNIQUE KEY `unique_sts_on_begin_end_index_digest` (`summary_begin_time`,`summary_end_time`,`index_name`,`digest`,`plan_digest`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
