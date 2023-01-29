class SoUser < ApplicationRecord
  self.table_name = "stackoverflow.users"
  self.inheritance_column = :_type_disabled
end
