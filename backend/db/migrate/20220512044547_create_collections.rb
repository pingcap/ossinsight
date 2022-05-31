class CreateCollections < ActiveRecord::Migration[6.1]
  def change
    create_table :collections do |t|
      t.string :name, index: {unique: true}, null: false
    end
  end
end
