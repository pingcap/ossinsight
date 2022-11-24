class CreateMentionLogs < ActiveRecord::Migration[6.1]
  def change
    create_table :mention_logs do |t|
      t.string :mention_type, default: 'repo'
      t.string :actor_login, index: {unique: true}, null: false
      t.datetime :created_at, null: false
    end
    # DO NOT mention users below again
    %w[wu-sheng kezhenxu94].each do |login|
      MentionLog.create(actor_login: login, mention_type: 'collection')
    end
  end
end
