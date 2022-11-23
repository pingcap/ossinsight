/*!40101 SET NAMES binary*/;
CREATE TABLE `repo_milestones` (
  `id` bigint(20) NOT NULL /*T![auto_rand] AUTO_RANDOM(5) */,
  `repo_id` int(11) NOT NULL DEFAULT '0',
  `milestone_type_id` int(11) NOT NULL DEFAULT '0',
  `milestone_number` int(11) NOT NULL DEFAULT '0',
  `payload` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `index_rm_on_repo_id_milestone_type_number` (`repo_id`,`milestone_type_id`,`milestone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin /*T![auto_rand_base] AUTO_RANDOM_BASE=180001 */;
