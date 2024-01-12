class SoTag < ApplicationRecord
  self.table_name = "stackoverflow.tags"
  self.inheritance_column = :_type_disabled
end
