class InitHackernewsDb < ActiveRecord::Migration[6.1]
  def change
    execute("CREATE DATABASE IF NOT EXISTS hackernews")
    sql = <<~SQL
      CREATE TABLE if not exists hackernews.items (
        `id` bigint(20) NOT NULL,
        `title` varchar(198) DEFAULT NULL,
        `url` varchar(6598) DEFAULT NULL,
        `text` text DEFAULT NULL,
        `type` varchar(8) NOT NULL DEFAULT 'story',
        `by` varchar(15) NOT NULL DEFAULT '',
        `time` int(11) NOT NULL,
        `score` int(11) NOT NULL DEFAULT '0',
        `parent` bigint(20) DEFAULT NULL,
        `descendants` int(11) DEFAULT '0',
        `deleted` tinyint(1) NOT NULL DEFAULT '0',
        `dead` tinyint(1) NOT NULL DEFAULT '0',
        `last_fetch_at` datetime NOT NULL DEFAULT '1970-01-01 00:00:01',
        PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
    SQL
    execute(sql)
  end
end
