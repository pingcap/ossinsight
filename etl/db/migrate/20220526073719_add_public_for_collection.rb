class AddPublicForCollection < ActiveRecord::Migration[6.1]
  def change
    add_column :collections, :public, :boolean, default: true
  end
end
