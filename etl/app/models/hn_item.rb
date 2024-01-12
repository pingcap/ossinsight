# == Schema Information
#
# Table name: hackernews.items
#
#  id            :bigint           not null, primary key
#  by            :string(15)       default(""), not null
#  dead          :boolean          default(FALSE), not null
#  deleted       :boolean          default(FALSE), not null
#  descendants   :integer          default(0)
#  kids          :json
#  last_fetch_at :datetime         default(Thu, 01 Jan 1970 00:00:01.000000000 UTC +00:00), not null
#  parent        :bigint
#  parts         :json
#  poll          :bigint
#  score         :integer          default(0), not null
#  text          :text(65535)
#  time          :integer          not null
#  title         :string(198)
#  type          :string(8)        default("story"), not null
#  url           :string(6598)
#
class HnItem < ApplicationRecord
  self.table_name = "hackernews.items"
  self.inheritance_column = :_type_disabled
end
