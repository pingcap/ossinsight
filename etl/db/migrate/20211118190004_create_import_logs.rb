class CreateImportLogs < ActiveRecord::Migration[6.1]
  def change
    create_table :import_logs do |t|
      t.string :filename, null: false, index: true
      t.string :local_file
      t.datetime :start_download_at
      t.datetime :end_download_at
      t.datetime :start_import_at
      t.datetime :end_import_at
      t.datetime :start_batch_at
      t.timestamps
    end
  end
end
