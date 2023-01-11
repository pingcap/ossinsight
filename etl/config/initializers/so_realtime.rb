class SoRealtime
  attr_reader :interval, :from

  def initialize(interval = 10, from = 73842327)
    @interval = interval
    @from = from
  end

  def run
    loop do 
      begin
        # go here
      rescue
        ActiveRecord::Base.connection.reconnect!
        puts $!
      end
      sleep(interval)
    end
  end

  def get_access_token
    # regist stackapp: https://stackapps.com/apps/oauth/view/25120
    puts "https://stackoverflow.com/oauth?client_id=#{ENV['SO_CLIENT_ID']}&scope=no_expiry&redirect_uri=https://ossinsight.io"
    authorization_code = nil # from above url to get authorization_code
    HTTParty.post("https://stackexchange.com/oauth/access_token", body: {
      client_id: ENV['SO_CLIENT_SECRET'],
      client_secret: ENV['SO_CLIENT_SECRET'],
      code: authorization_code,
      redirect_uri: "https://ossinsight.io"
    })
    # response -> "access_token=xx"
  end
end