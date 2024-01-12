/*!40101 SET NAMES binary*/;
CREATE TABLE `github_repo_languages` (
  `repo_id` int(11) NOT NULL,
  `language` varchar(32) NOT NULL,
  `size` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`repo_id`,`language`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
