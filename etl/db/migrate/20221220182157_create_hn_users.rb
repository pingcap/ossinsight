class CreateHnUsers < ActiveRecord::Migration[6.1]
  def change
    execute("CREATE DATABASE IF NOT EXISTS hackernews")
    sql = <<~SQL
      CREATE TABLE if not exists hackernews.users (
        `id` varchar(255) NOT NULL,
        `about` text,
        `karma` int(11) NOT NULL DEFAULT 0,
        `created` int(11) NOT NULL,
        `last_fetch_at` datetime NOT NULL DEFAULT '1970-01-01 00:00:01',
        PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
    SQL
    execute(sql)
  end
end
