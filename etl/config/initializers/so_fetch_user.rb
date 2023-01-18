require 'uri'
require 'open-uri'
require 'yajl'

class SoFetchUser
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
      SoUser.upsert_all(attrs)
    else
      puts "No response"
    end
  end

  def json_to_attrs(json)
    attr = {
      "id"=>json["user_id"],
      "display_name"=>json["display_name"],
      "about_me"=>json["about_me"],
      "age"=>json["age"],
      "creation_date"=> Time.at(json["creation_date"]),
      "last_access_date"=>Time.at(json["last_access_date"]),
      "last_modified_date"=> json['last_modified_date'] && Time.at(json["last_modified_date"]),
      "location"=> json["location"],
      "reputation"=>json["reputation"],
      "up_votes"=>json["up_vote_count"],
      "down_votes"=>json["up_vote_count"],
      "views"=>json["view_count"],
      "profile_image_url"=> json["profile_image"],
      "website_url"=>json["website_url"]
    }
    puts attr
    attr
  end
end
