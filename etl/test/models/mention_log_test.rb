# == Schema Information
#
# Table name: mention_logs
#
#  id           :bigint           not null, primary key
#  actor_login  :string(255)      not null
#  mention_type :string(255)      default("repo")
#  created_at   :datetime         not null
#
# Indexes
#
#  index_mention_logs_on_actor_login  (actor_login) UNIQUE
#
require "test_helper"

class MentionLogTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
