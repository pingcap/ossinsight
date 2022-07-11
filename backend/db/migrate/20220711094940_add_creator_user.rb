class AddCreatorUser < ActiveRecord::Migration[6.1]
  def change
    add_column :github_events, :creator_user_login, :string 
    add_column :github_events, :creator_user_id, :bigint
    add_column :github_events, :pr_or_issue_created_at, :datetime
  end
end
