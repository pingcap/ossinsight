/*!40101 SET NAMES binary*/;
CREATE TABLE `sys_watched_repos` (
  `user_id` int(11) NOT NULL,
  `repo_id` int(11) NOT NULL,
  `watched_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`repo_id`) /*T![clustered_index] NONCLUSTERED */,
  CONSTRAINT `sys_watched_repos_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
