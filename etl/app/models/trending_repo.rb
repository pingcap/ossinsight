# == Schema Information
#
# Table name: trending_repos
#
#  id         :bigint           not null, primary key
#  repo_name  :string(255)
#  created_at :datetime
#
# Indexes
#
#  index_trending_repos_on_created_at  (created_at)
#  index_trending_repos_on_repo_name   (repo_name)
#
class TrendingRepo < ApplicationRecord
end
