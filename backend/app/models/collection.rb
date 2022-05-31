# == Schema Information
#
# Table name: collections
#
#  id     :bigint           not null, primary key
#  name   :string(255)      not null
#  public :boolean          default(TRUE)
#
# Indexes
#
#  index_collections_on_name  (name) UNIQUE
#
class Collection < ApplicationRecord
  has_many :collection_items
end
