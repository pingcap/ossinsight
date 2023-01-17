require 'uri'
require 'open-uri'
require 'yajl'

class SoFetchAnswer
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
      SoAnswer.upsert_all(attrs)

    else
      puts "No response"
    end
  end

  def json_to_attrs(json)
    attr = {
      "id"=>json["answer_id"],
      "title"=>json["title"],
      "body"=>json["body"],
      "accepted_answer_id"=>json["accepted_answer_id"],
      "answer_count"=>json["answer_count"],
      "comment_count"=>json["comment_count"],
      "community_owned_date"=>nil,
      "creation_date"=> Time.at(json["creation_date"]),
      "favorite_count"=>json["favorite_count"],
      "last_activity_date"=>Time.at(json["last_activity_date"]),
      "last_edit_date"=> json['last_edit_date'] && Time.at(json["last_edit_date"]),
      "last_editor_display_name"=>json.dig("last_editor", "display_name"),
      "last_editor_user_id"=>json.dig("last_editor", "user_id"),
      "owner_display_name"=>json.dig("owner", "display_name"),
      "owner_user_id"=> json.dig("owner", "user_id") || -1,
      "parent_id"=> json["question_id"],
      "post_type_id"=>2,
      "score"=>json["score"],
      "tags"=>json["tags"].join(","),
      "view_count"=>json["view_count"]
    }
    attr
  end
end