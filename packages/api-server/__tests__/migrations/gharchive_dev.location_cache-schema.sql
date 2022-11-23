/*!40101 SET NAMES binary*/;
CREATE TABLE `location_cache` (
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valid` tinyint(1) NOT NULL DEFAULT '1',
  `formatted_address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `country_code` char(3) COLLATE utf8mb4_bin NOT NULL DEFAULT 'N/A',
  `region_code` char(3) COLLATE utf8mb4_bin NOT NULL DEFAULT 'N/A',
  `state` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '',
  `longitude` decimal(11,8) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `provider` varchar(20) COLLATE utf8mb4_bin NOT NULL DEFAULT 'UNKNOWN',
  PRIMARY KEY (`address`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
