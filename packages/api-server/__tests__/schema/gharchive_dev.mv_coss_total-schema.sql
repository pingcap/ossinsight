/*!40101 SET NAMES binary*/;
CREATE TABLE `mv_coss_total` (
  `github_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contributors` int(11) DEFAULT NULL,
  PRIMARY KEY (`github_name`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
