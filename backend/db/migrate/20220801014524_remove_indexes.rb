class RemoveIndexes < ActiveRecord::Migration[6.1]
  def change
    %W[additions deletions pr_changed_files comments push_distinct_size pr_review_comments type].each do |column|
      remove_index :github_events, column, if_exists: true
    end
  end
end