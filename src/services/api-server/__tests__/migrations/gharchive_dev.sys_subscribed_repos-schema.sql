/*!40101 SET NAMES binary*/;
CREATE TABLE `sys_subscribed_repos` (
  `user_id` int(11) NOT NULL,
  `repo_id` int(11) NOT NULL,
  `subscribed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `subscribed` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`user_id`,`repo_id`) /*T![clustered_index] NONCLUSTERED */,
  CONSTRAINT `fk_ssr_on_user_id` FOREIGN KEY (`user_id`) REFERENCES `sys_users` (`id`),
  CONSTRAINT `fk_ssr_on_repo_id` FOREIGN KEY (`repo_id`) REFERENCES `github_repos` (`repo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;