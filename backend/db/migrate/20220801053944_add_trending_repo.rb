class AddTrendingRepo < ActiveRecord::Migration[6.1]
  def change
    create_table :trending_repos do |t|
      t.string :repo_name, index: true
      t.datetime :created_at, index: true
    end
  end
end
