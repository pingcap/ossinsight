class RemoveMoreIndex < ActiveRecord::Migration[6.1]
  def change
    %W[event_year event_month event_day].each do |column|
      remove_index :github_events, column, if_exists: true
    end
  end
end
