class SoQuestion < ApplicationRecord
  self.table_name = "stackoverflow.questions"
  self.inheritance_column = :_type_disabled
end
