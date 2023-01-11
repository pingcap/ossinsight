require 'uri'
require 'open-uri'
require 'yajl'

class SoFetchQuestion
  attr_reader :ids, :url

  def initialize(ids)
    @ids = Array(ids)
    @url = "https://api.stackexchange.com/2.3/questions/#{ids.join(";")}?key=#{ENV['SO_KEY']}&site=stackoverflow&access_token=#{ENV['SO_ACCESS_TOKEN']}&pagesize=100&page=1&filter=withbody"
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
      puts json
      json
    else
      puts "No response"
    end
  end
end
