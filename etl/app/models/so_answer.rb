class SoAnswer < ApplicationRecord
  self.table_name = "stackoverflow.answers"
  self.inheritance_column = :_type_disabled
end
