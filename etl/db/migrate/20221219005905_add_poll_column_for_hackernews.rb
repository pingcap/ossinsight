class AddPollColumnForHackernews < ActiveRecord::Migration[6.1]
  def change
    add_column "hackernews.items", :poll, :bigint, if_not_exists: true
  end
end
