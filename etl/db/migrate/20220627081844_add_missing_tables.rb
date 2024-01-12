class AddMissingTables < ActiveRecord::Migration[6.1]
  def change
    execute(<<~SQL)
    CREATE TABLE IF NOT EXISTS `blacklist_users` (
      `login` varchar(255) NOT NULL,
      UNIQUE KEY `blacklist_users_login_uindex` (`login`),
      PRIMARY KEY (`login`)
    )  /* CACHED ON */
    SQL

    execute(<<~SQL)
    CREATE TABLE IF NOT EXISTS `blacklist_repos` (
      `name` varchar(255) DEFAULT NULL
    ) 
    SQL
  end
end
