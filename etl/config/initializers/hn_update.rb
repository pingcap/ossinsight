require_relative './hn_fetch_item'
require_relative './hn_fetch_user'

class HnUpdate
  UPDATE_URL = "https://hacker-news.firebaseio.com/v0/updates.json?print=pretty"

  def get_response
    resp = nil
    begin
      Retryable.retryable(tries: 5, on: [Timeout::Error, Net::OpenTimeout, OpenURI::HTTPError]) do
        resp = URI.open(UPDATE_URL, 
          open_timeout: 600, 
          read_timeout: 600,
          'user-agent' => 'ossinsight.io'
        )
      end
    rescue OpenURI::HTTPError
      puts "skip 404 file: #{UPDATE_URL}"
    else
      resp&.read
    end
  end

  def run
    json = get_response
    if json
      json = Yajl::Parser.parse(json)
      return if json.nil?
      json["items"].each do |item_id|
        i = HnItem.where(id: item_id).first
        if i && i.last_fetch_at >= 1.hour.ago
          puts "The item has updated within an hour, ignore #{item_id}"
          next
        end
        HnFetchItem.new(item_id).run
      end
      json["profiles"].each do |user_id|
        u = HnUser.where(id: user_id).first
        if u && u.last_fetch_at >= 1.hour.ago
          puts "The user has updated within an hour, ignore #{user_id}"
          next
        end
        HnFetchUser.new(user_id).run
      end
    else
      puts "No response"
    end
  end
end

