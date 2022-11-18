/*!40101 SET NAMES binary*/;
CREATE TABLE `mv_coss_dev_month` (
  `github_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_month` date NOT NULL,
  `event_num` int(11) DEFAULT NULL,
  `star_num` int(11) DEFAULT NULL,
  `pr_num` int(11) DEFAULT NULL,
  `issue_num` int(11) DEFAULT NULL,
  `dev_num` int(11) DEFAULT NULL,
  `star_dev_num` int(11) DEFAULT NULL,
  `pr_dev_num` int(11) DEFAULT NULL,
  `issue_dev_num` int(11) DEFAULT NULL,
  PRIMARY KEY (`github_name`,`event_month`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
