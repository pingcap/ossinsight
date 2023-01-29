class SoComment < ApplicationRecord
  self.table_name = "stackoverflow.comments"
  self.inheritance_column = :_type_disabled
end
