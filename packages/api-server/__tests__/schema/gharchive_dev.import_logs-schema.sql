/*!40101 SET NAMES binary*/;
CREATE TABLE `import_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `local_file` varchar(255) DEFAULT NULL,
  `start_download_at` datetime DEFAULT NULL,
  `end_download_at` datetime DEFAULT NULL,
  `start_import_at` datetime DEFAULT NULL,
  `end_import_at` datetime DEFAULT NULL,
  `start_batch_at` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_import_logs_on_filename` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=2550006;
