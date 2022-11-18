/*!40101 SET NAMES binary*/;
CREATE TABLE `trending_repos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `repo_name` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_trending_repos_on_repo_name` (`repo_name`),
  KEY `index_trending_repos_on_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=2160006;
