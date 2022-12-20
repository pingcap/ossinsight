require 'uri'
require 'open-uri'
require 'yajl'

class HnFetchItem
  attr_reader :item_id, :url

  def initialize(item_id)
    @item_id = item_id
    @url = "https://hacker-news.firebaseio.com/v0/item/#{item_id}.json?print=pretty"
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
      json.merge!(last_fetch_at: Time.now)
      HnItem.upsert(json)
      if json["by"].present?
        HnFetchUser.new(json["by"]).run
      end
    else
      puts "No response"
    end
  end
end
