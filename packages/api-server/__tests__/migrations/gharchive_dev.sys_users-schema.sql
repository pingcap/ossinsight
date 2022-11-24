/*!40101 SET NAMES binary*/;
CREATE TABLE `sys_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `email_get_updates` TINYINT(1) NOT NULL DEFAULT 0,
  `avatar_url` varchar(512) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'USER',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `enable` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_su_on_email_address` (`email_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;