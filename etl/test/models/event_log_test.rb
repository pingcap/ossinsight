# == Schema Information
#
# Table name: event_logs
#
#  id         :bigint           not null, primary key
#  created_at :datetime         not null
#
# Indexes
#
#  index_event_logs_on_created_at  (created_at)
#
require "test_helper"

class EventLogTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
