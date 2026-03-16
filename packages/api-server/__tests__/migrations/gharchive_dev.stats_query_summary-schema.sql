/*!40101 SET NAMES binary*/;
CREATE TABLE `stats_query_summary` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `query_name` varchar(128) NOT NULL,
  `digest_text` text NOT NULL,
  `executed_at` timestamp NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_sqs_on_executed_at` (`executed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=1260001;
