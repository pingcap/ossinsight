class AddIndexOnLastActivityDate < ActiveRecord::Migration[6.1]
  def change
    add_index "stackoverflow.questions", :last_activity_date
    add_index "stackoverflow.answers", :last_activity_date
  end
end
