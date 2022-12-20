# == Schema Information
#
# Table name: hackernews.users
#
#  id            :string(255)      not null, primary key
#  about         :text(65535)
#  created       :integer          not null
#  karma         :integer          default(0), not null
#  last_fetch_at :datetime         default(Thu, 01 Jan 1970 00:00:01.000000000 UTC +00:00), not null
#
class HnUser < ApplicationRecord
  self.table_name = "hackernews.users"
  self.inheritance_column = :_type_disabled
end
