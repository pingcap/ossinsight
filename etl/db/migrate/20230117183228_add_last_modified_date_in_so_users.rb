class AddLastModifiedDateInSoUsers < ActiveRecord::Migration[6.1]
  def change
    add_column "stackoverflow.users", :last_modified_date, :datetime, index: true
  end
end
