class DefaultNewCollectionsToPrivate < ActiveRecord::Migration[6.1]
  def up
    execute 'ALTER TABLE collections ALTER COLUMN public SET DEFAULT 0'
  end

  def down
    execute 'ALTER TABLE collections ALTER COLUMN public SET DEFAULT 1'
  end
end
