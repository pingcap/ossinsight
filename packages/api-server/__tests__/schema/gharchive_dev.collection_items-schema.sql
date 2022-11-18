/*!40101 SET NAMES binary*/;
CREATE TABLE `collection_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `collection_id` bigint(20) DEFAULT NULL,
  `repo_name` varchar(255) NOT NULL,
  `repo_id` bigint(20) NOT NULL,
  `last_month_rank` int(11) DEFAULT NULL,
  `last_2nd_month_rank` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_collection_items_on_collection_id` (`collection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=810018;
