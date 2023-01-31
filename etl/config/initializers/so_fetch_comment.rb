require 'uri'
require 'open-uri'
require 'yajl'

class SoFetchComment
  attr_reader :url

  def initialize(url)
    @url = url
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
      quota_remaining = json["quota_remaining"]
      puts quota_remaining
      items = json["items"]
      attrs = items.map { |item| json_to_attrs(item) }
      SoComment.upsert_all(attrs)

    else
      puts "No response"
    end
  end

  def json_to_attrs(json)
    attr = {
      "id"=>json["comment_id"],
      "text"=>json["body"],
      "creation_date"=> Time.at(json["creation_date"]),
      "user_display_name"=>json.dig("owner", "display_name"),
      "user_id"=> json.dig("owner", "user_id") || -1,
      "post_id"=> json["post_id"],
      "post_type"=> json["post_type"],
      "score"=>json["score"]
    }
    attr
  end
end