class CreateEventLogs < ActiveRecord::Migration[6.1]
  def change
    create_table :event_logs, id: false do |t|
      t.primary_key :id, :bigint
      t.datetime :created_at, index: true, null: false
    end
  end
end
