class AddPartsAndKidsForHackernews < ActiveRecord::Migration[6.1]
  def change
    add_column "hackernews.items", :kids, :json, if_not_exists: true
    add_column "hackernews.items", :parts, :json, if_not_exists: true
  end
end
