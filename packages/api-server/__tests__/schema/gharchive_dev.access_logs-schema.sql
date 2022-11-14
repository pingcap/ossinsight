/*!40101 SET NAMES binary*/;
CREATE TABLE `access_logs` (
  `id` bigint(20) NOT NULL /*T![auto_rand] AUTO_RANDOM(5) */,
  `remote_addr` varchar(128) NOT NULL DEFAULT '',
  `origin` varchar(128) NOT NULL DEFAULT '',
  `status_code` int(11) NOT NULL DEFAULT '0',
  `request_path` varchar(256) NOT NULL DEFAULT '',
  `request_params` json DEFAULT NULL,
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_al_on_requested_at` (`requested_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin /*T![auto_rand_base] AUTO_RANDOM_BASE=2940002 */;
