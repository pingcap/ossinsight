/*!40101 SET NAMES binary*/;
CREATE TABLE `github_repo_topics` (
  `repo_id` int(11) NOT NULL,
  `topic` varchar(50) NOT NULL,
  PRIMARY KEY (`repo_id`,`topic`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
