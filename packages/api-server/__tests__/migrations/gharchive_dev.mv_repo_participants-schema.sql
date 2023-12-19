CREATE TABLE `mv_repo_participants` (
    `repo_id` int(11) NOT NULL,
    `user_login` varchar(40) NOT NULL,
    `first_engagement_at` datetime DEFAULT NULL,
    `last_engagement_at` datetime DEFAULT NULL,
    PRIMARY KEY (`repo_id`,`user_login`) /*T![clustered_index] CLUSTERED */,
    KEY `idx_mrp_repo_id_first_engagement_at` (`repo_id`,`first_engagement_at`,`user_login`),
    KEY `idx_mrp_repo_id_last_engagement_at` (`repo_id`,`last_engagement_at`,`user_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;