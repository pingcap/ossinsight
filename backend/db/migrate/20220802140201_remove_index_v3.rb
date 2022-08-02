class RemoveIndexV3 < ActiveRecord::Migration[6.1]
  def change
    %W[action language].each do |column|
      remove_index :github_events, column, if_exists: true
    end
  end
end
