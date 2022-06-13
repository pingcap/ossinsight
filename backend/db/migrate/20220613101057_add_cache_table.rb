class AddCacheTable < ActiveRecord::Migration[6.1]
  def change
    execute(<<~SQL)
      CREATE TABLE IF NOT EXISTS cache
      (
          cache_key   VARCHAR(512)   NOT NULL PRIMARY KEY,
          cache_value JSON           NOT NULL,
          created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          expires     INT DEFAULT -1 NULL COMMENT 'cache will expire after n seconds'
      );
    SQL

    execute(<<~SQL)
      CREATE TABLE IF NOT EXISTS cached_table_cache
      (
          cache_key   VARCHAR(512)   NOT NULL PRIMARY KEY,
          cache_value JSON           NOT NULL,
          created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          expires     INT DEFAULT -1 NULL COMMENT 'cache will expire after n seconds'
      );
    SQL

    execute(<<~SQL)
      ALTER TABLE cached_table_cache CACHE;
    SQL
  end
end
