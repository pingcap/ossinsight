class AddUsers < ActiveRecord::Migration[6.1]
  def change
    sql = <<~SQL
      CREATE TABLE `users` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `login` varchar(255) COLLATE utf8mb4_bin NOT NULL,
        `company` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `type` varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT 'USR',
        `fake` tinyint(1) NOT NULL DEFAULT '0',
        `deleted` tinyint(1) NOT NULL DEFAULT '0',
        `long` decimal(11,8) DEFAULT NULL,
        `lat` decimal(10,8) DEFAULT NULL,
        `country_code` char(3) COLLATE utf8mb4_bin DEFAULT NULL,
        `state` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        `city` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        `location` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
        PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
        KEY `index_login_on_users` (`login`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin 
    SQL

    execute(sql)
  end
end
