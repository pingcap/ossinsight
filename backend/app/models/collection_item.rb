# == Schema Information
#
# Table name: collection_items
#
#  id            :bigint           not null, primary key
#  repo_name     :string(255)      not null
#  collection_id :bigint
#  repo_id       :bigint           not null
#
# Indexes
#
#  index_collection_items_on_collection_id  (collection_id)
#
class CollectionItem < ApplicationRecord
  belongs_to :collection
end
