class CreateCollectionItems < ActiveRecord::Migration[6.1]
  def change
    create_table :collection_items do |t|
      t.bigint :collection_id, index: true
      t.string :repo_name, null: false
      t.bigint :repo_id, null: false
    end
  end
end
