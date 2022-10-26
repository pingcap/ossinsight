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
class EventLog < ApplicationRecord
end
