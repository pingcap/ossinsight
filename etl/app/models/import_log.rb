# == Schema Information
#
# Table name: import_logs
#
#  id                :bigint           not null, primary key
#  end_download_at   :datetime
#  end_import_at     :datetime
#  filename          :string(255)      not null
#  local_file        :string(255)
#  start_batch_at    :datetime
#  start_download_at :datetime
#  start_import_at   :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_import_logs_on_filename  (filename)
#
class ImportLog < ApplicationRecord
  def date_id
    m = filename.match(/(\d{4})-(\d{2})-(\d{2})-(\d{1,2})/)
    [
      m[1],
      m[2],
      m[3],
      '%02d' % m[4]
    ].join
  end

  def date_str
    filename[0, 10]
  end
end
