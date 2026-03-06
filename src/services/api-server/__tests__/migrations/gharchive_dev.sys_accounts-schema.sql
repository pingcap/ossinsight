/*!40101 SET NAMES binary*/;
CREATE TABLE `sys_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `provider` varchar(20) NOT NULL,
  `provider_account_id` varchar(128) NOT NULL,
  `provider_account_login` varchar(128) DEFAULT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `index_sa_on_user_id_provider_account_id` (`user_id`,`provider`,`provider_account_id`),
  CONSTRAINT `fk_sa_on_user_id` FOREIGN KEY (`user_id`) REFERENCES `sys_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;