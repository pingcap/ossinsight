class AddIndexOnLastModifiedDate < ActiveRecord::Migration[6.1]
  def change
    add_index "stackoverflow.comments", :creation_date
    add_index "stackoverflow.users", :last_modified_date
    add_index "stackoverflow.users", :creation_date
  end
end
