require 'twitter'
require 'uri'
require 'open-uri'
require 'yajl'
require "htmlcsstoimage"

class TweetCollection
  include ActionView::Helpers
  attr_reader :client, :collection_name, :collection_id, :github_tokens, :github_token_size, :collection_name_for_url

  def initialize(collection_name, collection_id)
    @client = Twitter::REST::Client.new do |config|
      config.consumer_key        = ENV['API_KEY']
      config.consumer_secret     = ENV['API_KEY_SECRET']
      config.access_token        = ENV['ACCESS_TOKEN']
      config.access_token_secret = ENV['ACCESS_TOKEN_SECRET']
    end
    @collection_name = collection_name
    @collection_id = collection_id
    @github_tokens = ENV["GITHUB_TOKEN"].split(",")
    @github_token_size = @github_tokens.size
    @collection_name_for_url = {
      "UI Framework and UIkit" => "ui-framework-and-u-ikit",
      "iOS Framework" => "i-os-framework",
      "MLOps Tools" => "ml-ops-tools",
      "WebAssembly Runtime" => "web-assembly-runtime",
      "PaaS" => "paa-s"
    }[collection_name] || collection_name.downcase.gsub(/\s+/, '-')
  end

  def tweet!
    client.update_with_media(text, generate_img)
  end

  def list_twitter_logins(n = 10)
    logins = []
    get_contributors.each do |github_login|
      break if logins.size >= n
      info = user_info(github_login)
      if info['twitter_username'].present?
        logins << info['twitter_username']
        MentionLog.create(actor_login: github_login, mention_type: 'collection')
      end
    end
    logins
  end

  def generate_img 
    url = "https://ossinsight.io/collections/#{collection_name_for_url}"
    img_client = HTMLCSSToImage.new
    img = img_client.create_image('', 
      url: url, 
      viewport_width: 768,
      viewport_height: 1524,
      selector: "#__docusaurus > div.main-wrapper.mainWrapper_eExm > div:nth-child(2) > main > div > div > main > div > div:nth-child(4) > section > div.MuiTableContainer-root")
    URI.open(img.url, read_timeout: 1000)
  end

  def text
    logins = list_twitter_logins

    txt = <<~TXT
    Last 28 days growth ranking of #{collection_name}
    TXT

    contributors_txt = <<~TXT
    Thanks to the contributors: #{logins.map{|x| '@' + x }.join(" ")}
    TXT

    txt << "\n" + contributors_txt if logins.present? 
    txt << "\n" + "More ranking 👀 👉 https://ossinsight.io/collections/#{collection_name_for_url}"

    puts txt
    puts txt.size
    txt
  end

  def user_info(github_login)
    token = github_tokens[rand(github_token_size)]
    url = "https://api.github.com/users/#{github_login}"
    get_json(url, token)
  end


  def get_json(url, github_token)
    token = github_token
    resp = nil
    raw_json = begin
      Retryable.retryable(tries: 5, on: [Timeout::Error, Net::OpenTimeout, OpenURI::HTTPError]) do
        resp = URI.open(url, 
          open_timeout: 600, 
          read_timeout: 600,
          'user-agent' => 'ossinsight.io',
          'Authorization' => 'token ' + token
        )
      end
    rescue OpenURI::HTTPError
      puts "skip 404 file: #{url}"
    else
      resp&.read
    end
    json = if raw_json
      Yajl::Parser.parse(raw_json)
    else
      {}
    end
    json
  end

  def get_contributors(n = 50)
    sql = <<~SQL
      select creator_user_login as login, count(*) as count 
      from github_events 
      where type = 'PullRequestEvent' 
            and repo_id in (select repo_id from collection_items where collection_id = #{collection_id})  
            and pr_merged = 1
            and creator_user_login not like '%bot%'
            and creator_user_login not in (select actor_login from mention_logs)
      group by 1 
      order by 2 desc   
      limit #{n}
    SQL
    results = ActiveRecord::Base.connection.select_all(sql)
    results.to_a.map { |r| r['login'] }
  end
end
