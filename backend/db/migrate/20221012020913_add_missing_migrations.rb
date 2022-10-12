class AddMissingMigrations < ActiveRecord::Migration[6.1]
  def change
    add_column :collection_items, :last_month_rank, :integer, if_not_exists: true
    add_column :collection_items, :last_2nd_month_rank, :integer, if_not_exists: true
  end
end
