class AddOsdbRepo < ActiveRecord::Migration[6.1]
  def change
    execute(<<~SQL)
      CREATE TABLE IF NOT EXISTS `osdb_repos` (
        `id` varchar(255) NOT NULL,
        `name` varchar(255) DEFAULT NULL,
        `group_name` varchar(255) DEFAULT NULL,
        PRIMARY KEY (`id`)
      ) 
    SQL
  end
end
