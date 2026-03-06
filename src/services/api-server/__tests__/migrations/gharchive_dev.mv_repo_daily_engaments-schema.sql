CREATE TABLE `mv_repo_daily_engagements` (
    `repo_id` int(11) NOT NULL,
    `day` date NOT NULL,
    `user_login` varchar(40) NOT NULL,
    `engagements` int(11) DEFAULT NULL,
    PRIMARY KEY (`repo_id`,`day`,`user_login`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
