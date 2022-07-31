require 'twitter'
require 'uri'
require 'open-uri'
require 'yajl'

class TweetRepo
  attr_reader :client, :repo, :github_tokens, :github_token_size

  def initialize(repo)
    @client = Twitter::REST::Client.new do |config|
      config.consumer_key        = ENV['API_KEY']
      config.consumer_secret     = ENV['API_KEY_SECRET']
      config.access_token        = ENV['ACCESS_TOKEN']
      config.access_token_secret = ENV['ACCESS_TOKEN_SECRET']
    end
    @repo = repo
    @github_tokens = ENV["GITHUB_TOKEN"].split(",")
    @github_token_size = @github_tokens.size
  end

  def tweet!
    client.update(text)
  end

  def list_twitter_logins(n = 5)
    get_contributors.map do |github_login|
      info = user_info(github_login)
      info['twitter_username']
    end.compact
  end

  def text
    "Hello, https://github.com/#{repo}, contributes -> #{list_twitter_logins.join(", ")}"
  end

  def image 
  end

  def user_info(github_login)
    token = github_tokens[rand(github_token_size)]
    url = "https://api.github.com/users/#{github_login}"
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
    if raw_json
      json = Yajl::Parser.parse(raw_json)
    else
      {}
    end
  end

  def get_contributors(n = 10)
    sql = <<~SQL
      select creator_user_login as login, count(*) as count 
      from github_events 
      where type = 'PullRequestEvent' 
            and repo_name = '#{repo}' 
            and not creator_user_login like '%bot%'
      group by 1 
      order by 2 desc   
      limit #{n}
    SQL
    results = ActiveRecord::Base.connection.select_all(sql)
    results.to_a.map { |r| r['login'] }
  end
end