require_relative './so_fetch_comment'

class SoRealtimeComment
  attr_reader :interval, :access_token, :url

  def initialize(access_token, interval = 20)
    @interval = interval
    @access_token = access_token
    @url = "https://api.stackexchange.com/2.3/comments?page=1&pagesize=100&order=asc&sort=creation&site=stackoverflow&filter=!6Wfm_gUmntkf8&access_token=#{ENV['SO_ACCESS_TOKEN']}&key=#{ENV['SO_KEY']}"
  end

  def run
    loop do 
      begin
        new_url = url + "&min=" + last_activity_date_in_db.to_s
        SoFetchComment.new(new_url).run
      rescue
        ActiveRecord::Base.connection.reconnect!
        puts $!
        puts 'error'
      end
      sleep(interval)
    end
  end

  def last_activity_date_in_db
    (SoComment.maximum(:creation_date) || Time.parse("2008-01-01 00:00")).to_i
  end
end