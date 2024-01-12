/*!40101 SET NAMES binary*/;
CREATE TABLE `sys_sent_repo_milestones` (
  `user_id` int(11) NOT NULL,
  `repo_milestone_id` bigint(11) NOT NULL,
  `sent_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`repo_milestone_id`) /*T![clustered_index] CLUSTERED */,
  CONSTRAINT `sys_sent_repo_milestones_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
