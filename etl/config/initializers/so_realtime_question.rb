require_relative './so_fetch_question'

class SoRealtimeQuestion
  attr_reader :interval, :access_token, :url

  def initialize(access_token, interval = 20)
    @interval = interval
    @access_token = access_token
    @url = "https://api.stackexchange.com/2.3/questions?page=1&pagesize=100&order=asc&sort=activity&site=stackoverflow&filter=!)5esRy)TSO9H7Qhh6n-YJ7jtcNBf&access_token=#{ENV['SO_ACCESS_TOKEN']}&key=#{ENV['SO_KEY']}"
  end

  def run
    loop do 
      begin
        new_url = url + "&min=" + last_activity_date_in_db.to_s
        SoFetchQuestion.new(new_url).run
      rescue
        ActiveRecord::Base.connection.reconnect!
        puts $!
        puts 'error'
      end
      sleep(interval)
    end
  end

  def last_activity_date_in_db
    (SoQuestion.maximum(:last_activity_date) || Time.parse("2008-01-01 00:00")).to_i
  end

  def get_access_token
    # regist stackapp: https://stackapps.com/apps/oauth/view/25120
    puts "https://stackoverflow.com/oauth?client_id=#{ENV['SO_CLIENT_ID']}&scope=no_expiry&redirect_uri=https://ossinsight.io"
    authorization_code = nil # from above url to get authorization_code
    HTTParty.post("https://stackexchange.com/oauth/access_token", body: {
      client_id: ENV['SO_CLIENT_ID'],
      client_secret: ENV['SO_CLIENT_SECRET'],
      code: authorization_code,
      redirect_uri: "https://ossinsight.io"
    })
    # response -> "access_token=xx"
  end
end