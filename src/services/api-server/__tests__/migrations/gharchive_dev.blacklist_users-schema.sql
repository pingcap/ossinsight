/*!40101 SET NAMES binary*/;
CREATE TABLE `blacklist_users` (
  `login` varchar(255) NOT NULL,
  UNIQUE KEY `blacklist_users_login_uindex` (`login`),
  PRIMARY KEY (`login`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
