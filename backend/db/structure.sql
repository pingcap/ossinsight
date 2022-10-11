
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `ar_internal_metadata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ar_internal_metadata` (
  `key` varchar(255) NOT NULL,
  `value` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`key`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `blacklist_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blacklist_repos` (
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `blacklist_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blacklist_users` (
  `login` varchar(255) NOT NULL,
  UNIQUE KEY `blacklist_users_login_uindex` (`login`),
  PRIMARY KEY (`login`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `cache_key` varchar(512) NOT NULL,
  `cache_value` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires` int(11) DEFAULT '-1' COMMENT 'cache will expire after n seconds',
  PRIMARY KEY (`cache_key`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cached_table_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cached_table_cache` (
  `cache_key` varchar(512) NOT NULL,
  `cache_value` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires` int(11) DEFAULT '-1' COMMENT 'cache will expire after n seconds',
  PRIMARY KEY (`cache_key`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin /* CACHED ON */;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cn_orgs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_orgs` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cn_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cn_repos` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `collection_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `collection_id` bigint(20) DEFAULT NULL,
  `repo_name` varchar(255) NOT NULL,
  `repo_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_collection_items_on_collection_id` (`collection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collections` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `public` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `index_collections_on_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `css_framework_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `css_framework_repos` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `db_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `db_repos` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `event_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_event_logs_on_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `github_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `github_events` (
  `id` bigint(20) NOT NULL DEFAULT '0',
  `type` varchar(29) NOT NULL DEFAULT 'WatchEvent',
  `created_at` datetime NOT NULL,
  `repo_id` bigint(20) NOT NULL DEFAULT '0',
  `repo_name` varchar(140) NOT NULL DEFAULT '',
  `actor_id` bigint(20) NOT NULL DEFAULT '0',
  `actor_login` varchar(40) NOT NULL DEFAULT '',
  `language` varchar(26) NOT NULL DEFAULT '',
  `additions` bigint(20) NOT NULL DEFAULT '0',
  `deletions` bigint(20) NOT NULL DEFAULT '0',
  `action` varchar(11) NOT NULL DEFAULT '',
  `number` int(11) NOT NULL DEFAULT '0',
  `commit_id` varchar(40) NOT NULL DEFAULT '',
  `comment_id` bigint(20) NOT NULL DEFAULT '0',
  `org_login` varchar(40) NOT NULL DEFAULT '',
  `org_id` bigint(20) NOT NULL DEFAULT '0',
  `state` varchar(6) NOT NULL DEFAULT '',
  `closed_at` datetime NOT NULL DEFAULT '1970-01-01 00:00:00',
  `comments` int(11) NOT NULL DEFAULT '0',
  `pr_merged_at` datetime NOT NULL DEFAULT '1970-01-01 00:00:00',
  `pr_merged` tinyint(1) NOT NULL DEFAULT '0',
  `pr_changed_files` int(11) NOT NULL DEFAULT '0',
  `pr_review_comments` int(11) NOT NULL DEFAULT '0',
  `pr_or_issue_id` bigint(20) NOT NULL DEFAULT '0',
  `event_day` date NOT NULL,
  `event_month` date NOT NULL,
  `event_year` int(11) NOT NULL,
  `push_size` int(11) NOT NULL DEFAULT '0',
  `push_distinct_size` int(11) NOT NULL DEFAULT '0',
  `creator_user_login` varchar(40) NOT NULL DEFAULT '',
  `creator_user_id` bigint(20) NOT NULL DEFAULT '0',
  `pr_or_issue_created_at` datetime NOT NULL DEFAULT '1970-01-01 00:00:00',
  KEY `index_github_events_on_id` (`id`),
  KEY `index_github_events_on_actor_login` (`actor_login`),
  KEY `index_github_events_on_created_at` (`created_at`),
  KEY `index_github_events_on_repo_name` (`repo_name`),
  KEY `index_github_events_on_repo_id_type_action_month_actor_login` (`repo_id`,`type`,`action`,`event_month`,`actor_login`),
  KEY `index_ge_on_repo_id_type_action_pr_merged_created_at_add_del` (`repo_id`,`type`,`action`,`pr_merged`,`created_at`,`additions`,`deletions`),
  KEY `index_ge_on_creator_id_type_action_merged_created_at_add_del` (`creator_user_id`,`type`,`action`,`pr_merged`,`created_at`,`additions`,`deletions`),
  KEY `index_ge_on_actor_id_type_action_created_at_repo_id_commits` (`actor_id`,`type`,`action`,`created_at`,`repo_id`,`push_distinct_size`),
  KEY `index_ge_on_org_id_type_action_pr_merged_created_at_add_del` (`org_id`,`type`,`action`,`pr_merged`,`created_at`,`additions`,`deletions`),
  KEY `index_ge_on_repo_id_type_action_created_at_number_pdsize_psize` (`repo_id`,`type`,`action`,`created_at`,`number`,`push_distinct_size`,`push_size`),
  KEY `index_ge_on_org_id_type_action_created_at_number_pdsize_psize` (`org_id`,`type`,`action`,`created_at`,`number`,`push_distinct_size`,`push_size`),
  KEY `index_github_events_on_org_id_type_action_month_actor_login` (`org_id`,`type`,`action`,`event_month`,`actor_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
PARTITION BY LIST COLUMNS(`type`)
(PARTITION `push_event` VALUES IN ('PushEvent'),
 PARTITION `create_event` VALUES IN ('CreateEvent'),
 PARTITION `pull_request_event` VALUES IN ('PullRequestEvent'),
 PARTITION `watch_event` VALUES IN ('WatchEvent'),
 PARTITION `issue_comment_event` VALUES IN ('IssueCommentEvent'),
 PARTITION `issues_event` VALUES IN ('IssuesEvent'),
 PARTITION `delete_event` VALUES IN ('DeleteEvent'),
 PARTITION `fork_event` VALUES IN ('ForkEvent'),
 PARTITION `pull_request_review_comment_event` VALUES IN ('PullRequestReviewCommentEvent'),
 PARTITION `pull_request_review_event` VALUES IN ('PullRequestReviewEvent'),
 PARTITION `gollum_event` VALUES IN ('GollumEvent'),
 PARTITION `release_event` VALUES IN ('ReleaseEvent'),
 PARTITION `member_event` VALUES IN ('MemberEvent'),
 PARTITION `commit_comment_event` VALUES IN ('CommitCommentEvent'),
 PARTITION `public_event` VALUES IN ('PublicEvent'),
 PARTITION `gist_event` VALUES IN ('GistEvent'),
 PARTITION `follow_event` VALUES IN ('FollowEvent'),
 PARTITION `event` VALUES IN ('Event'),
 PARTITION `download_event` VALUES IN ('DownloadEvent'),
 PARTITION `team_add_event` VALUES IN ('TeamAddEvent'),
 PARTITION `fork_apply_event` VALUES IN ('ForkApplyEvent'));
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `import_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `js_framework_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `js_framework_repos` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `nocode_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nocode_repos` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `osdb_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `osdb_repos` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `programming_language_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programming_language_repos` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `schema_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_migrations` (
  `version` varchar(255) NOT NULL,
  PRIMARY KEY (`version`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `static_site_generator_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `static_site_generator_repos` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `trending_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trending_repos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `repo_name` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_trending_repos_on_repo_name` (`repo_name`),
  KEY `index_trending_repos_on_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(255) NOT NULL DEFAULT 'USR',
  `fake` tinyint(1) NOT NULL DEFAULT '0',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `long` decimal(11,8) DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `country_code` char(3) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `index_login_on_users` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `web_framework_repos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `web_framework_repos` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] NONCLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `schema_migrations` (version) VALUES
('20211118190004'),
('20211205174309'),
('20211205190931'),
('20211206155721'),
('20211208112931'),
('20211214161151'),
('20220110101625'),
('20220111101529'),
('20220111105518'),
('20220111105944'),
('20220111112315'),
('20220112163444'),
('20220512044547'),
('20220512044558'),
('20220526073719'),
('20220526174823'),
('20220613101057'),
('20220627072814'),
('20220627081844'),
('20220801053944'),
('20220818090000');


