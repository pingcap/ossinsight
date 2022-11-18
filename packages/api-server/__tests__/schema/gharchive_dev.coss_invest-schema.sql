/*!40101 SET NAMES binary*/;
CREATE TABLE `coss_invest` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repository` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stage` enum('Seed','A','B','C','D','E','F','G','Growth') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `round_size` decimal(10,2) DEFAULT NULL,
  `year` year(4) DEFAULT NULL,
  `month` int(11) DEFAULT NULL,
  `lead_investor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_repo` tinyint(1) DEFAULT NULL,
  `has_github` tinyint(1) DEFAULT NULL,
  `github_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `link` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30507;
