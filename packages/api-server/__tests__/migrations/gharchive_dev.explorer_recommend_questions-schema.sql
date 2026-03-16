CREATE TABLE `explorer_recommend_questions` (
    `hash` varchar(128) NOT NULL,
    `title` varchar(255) NOT NULL,
    `ai_generated` tinyint(1) NOT NULL DEFAULT '0',
    PRIMARY KEY (`hash`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

