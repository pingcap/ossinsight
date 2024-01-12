require 'uri'
require 'open-uri'
require 'yajl'

class HnFetchUser
  attr_reader :user_id, :url

  def initialize(user_id)
    @user_id = user_id
    @url = "https://hacker-news.firebaseio.com/v0/user/#{user_id}.json?print=pretty"
  end

  def get_response
    resp = nil
    begin
      Retryable.retryable(tries: 5, on: [Timeout::Error, Net::OpenTimeout, OpenURI::HTTPError]) do
        resp = URI.open(url, 
          open_timeout: 600, 
          read_timeout: 600,
          'user-agent' => 'ossinsight.io'
        )
      end
    rescue OpenURI::HTTPError
      puts "skip 404 file: #{url}"
    else
      resp&.read
    end
  end

  def run
    json = get_response
    if json
      json = Yajl::Parser.parse(json)
      return if json.nil?
      json.delete("submitted")
      json.delete("delay")
      json.merge!(last_fetch_at: Time.now)
      json['about'] = json['about'].to_s[0,60000]
      HnUser.upsert(json)
    else
      puts "No response"
    end
  end
end
