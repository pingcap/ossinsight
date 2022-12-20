# == Schema Information
#
# Table name: github_events
#
#  id                     :bigint           default(0), not null
#  action                 :string(11)       default(""), not null
#  actor_login            :string(40)       default(""), not null
#  additions              :bigint           default(0), not null
#  closed_at              :datetime         default(Thu, 01 Jan 1970 00:00:00.000000000 UTC +00:00), not null
#  comments               :integer          default(0), not null
#  creator_user_login     :string(40)       default(""), not null
#  deletions              :bigint           default(0), not null
#  event_day              :date             not null
#  event_month            :date             not null
#  event_year             :integer          not null
#  language               :string(26)       default(""), not null
#  number                 :integer          default(0), not null
#  org_login              :string(40)       default(""), not null
#  pr_changed_files       :integer          default(0), not null
#  pr_merged              :boolean          default(FALSE), not null
#  pr_merged_at           :datetime         default(Thu, 01 Jan 1970 00:00:00.000000000 UTC +00:00), not null
#  pr_or_issue_created_at :datetime         default(Thu, 01 Jan 1970 00:00:00.000000000 UTC +00:00), not null
#  pr_review_comments     :integer          default(0), not null
#  push_distinct_size     :integer          default(0), not null
#  push_size              :integer          default(0), not null
#  repo_name              :string(140)      default(""), not null
#  state                  :string(6)        default(""), not null
#  type                   :string(29)       default("Event"), not null
#  created_at             :datetime         default(Thu, 01 Jan 1970 00:00:00.000000000 UTC +00:00), not null
#  actor_id               :bigint           default(0), not null
#  comment_id             :bigint           default(0), not null
#  commit_id              :string(40)       default(""), not null
#  creator_user_id        :bigint           default(0), not null
#  org_id                 :bigint           default(0), not null
#  pr_or_issue_id         :bigint           default(0), not null
#  repo_id                :bigint           default(0), not null
#
# Indexes
#
#  index_ge_on_actor_id_type_action_created_at_repo_id_commits     (actor_id,type,action,created_at,repo_id,push_distinct_size)
#  index_ge_on_creator_id_type_action_merged_created_at_add_del    (creator_user_id,type,action,pr_merged,created_at,additions,deletions)
#  index_ge_on_org_id_type_action_created_at_number_pdsize_psize   (org_id,type,action,created_at,number,push_distinct_size,push_size)
#  index_ge_on_org_id_type_action_pr_merged_created_at_add_del     (org_id,type,action,pr_merged,created_at,additions,deletions)
#  index_ge_on_repo_id_type_action_created_at_number_pdsize_psize  (repo_id,type,action,created_at,number,push_distinct_size,push_size)
#  index_ge_on_repo_id_type_action_pr_merged_created_at_add_del    (repo_id,type,action,pr_merged,created_at,additions,deletions)
#  index_github_events_on_actor_login                              (actor_login)
#  index_github_events_on_created_at                               (created_at)
#  index_github_events_on_id                                       (id)
#  index_github_events_on_org_id_type_action_month_actor_login     (org_id,type,action,event_month,actor_login)
#  index_github_events_on_repo_id_type_action_month_actor_login    (repo_id,type,action,event_month,actor_login)
#  index_github_events_on_repo_name                                (repo_name)
#
require "test_helper"

class GithubEventTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
