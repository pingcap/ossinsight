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
require "test_helper"

class CollectionTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
