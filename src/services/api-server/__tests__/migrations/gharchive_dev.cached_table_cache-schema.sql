/*!40101 SET NAMES binary*/;
CREATE TABLE `cached_table_cache` (
  `cache_key` varchar(512) NOT NULL,
  `cache_value` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires` int(11) DEFAULT '-1' COMMENT 'cache will expire after n seconds',
  PRIMARY KEY (`cache_key`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
