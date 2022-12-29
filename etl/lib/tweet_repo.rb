require 'twitter'
require 'uri'
require 'open-uri'
require 'yajl'
require "htmlcsstoimage"

class TweetRepo
  include ActionView::Helpers
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
    return if repo_info["description"].to_s.scan(/\p{Han}+/).join.size >= 10
    if repo_info["stargazers_count"].to_i > 10000
      client.update_with_media(text, generate_img)
    else
      client.update(text)
    end
  end

  def list_twitter_logins(n = 5)
    logins = []
    get_contributors.each do |github_login|
      break if logins.size >= n
      info = user_info(github_login)
      if info['twitter_username'].present? 
        logins << info['twitter_username'] 
        MentionLog.create(actor_login: github_login, mention_type: 'repo')
      end
    end
    logins
  end

  def generate_img 
    url = "https://ossinsight.io/analyze/#{repo}"
    img_client = HTMLCSSToImage.new
    img = img_client.create_image('', url: url, selector: "#overview-main")
    URI.open(img.url, read_timeout: 1000)
  end

  def text
    info = repo_info 

    language = info["language"]
    language = "cpp" if language == 'C++'
    language = "csharp" if language == 'C#'
    language = "golang" if language == 'Go'
    language = "rustlang" if language == 'Rust'
    language = "python" if language == 'Jupyter Notebook'

    stars_count = info["stargazers_count"].to_i
    stars_count_pretty = stars_for_human(stars_count)
    stars_incr = stars_incr_count_last_7_days
    logins = list_twitter_logins

    repo_desc = if stars_count > 10000
      repo
    else
      "https://github.com/#{repo}"
    end

    txt = <<~TXT
    Congrats to #{repo_desc}, which has grown by #{[stars_incr, stars_count].min} stars in the last 7 days and has reached #{stars_count_pretty} stars. 
    TXT

    contributors_txt = <<~TXT
    Thanks to the contributors: #{logins.map{|x| '@' + x }.join(" ")}
    TXT

    txt << "\n" + contributors_txt if logins.present? 
    txt << "\n" + " https://ossinsight.io/analyze/#{repo}"
    txt << "\n" + "##{language}" if language.present? 

    puts txt
    puts txt.size
    txt
  end

  def stars_incr_count_last_7_days
    sql = <<~SQL
    select count(*) as count
    from github_events
    where repo_name = '#{repo}' and created_at >= '#{7.days.ago.to_s(:db)}' and type = 'WatchEvent'
    SQL
    ActiveRecord::Base.connection.select_one(sql)["count"]
  end

  # 3210 to 3.2K
  def stars_for_human(stars_count)
    number_to_human(stars_count, :format => '%n%u', :units => { :thousand => 'K' })
  end

  def user_info(github_login)
    token = github_tokens[rand(github_token_size)]
    url = "https://api.github.com/users/#{github_login}"
    get_json(url, token)
  end

  def repo_info
    token = github_tokens[rand(github_token_size)]
    url = "https://api.github.com/repos/#{repo}"
    @repo_info ||= get_json(url, token)
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

  def get_contributors(n = 30)
    sql = <<~SQL
      select creator_user_login as login, count(*) as count 
      from github_events 
      where type = 'PullRequestEvent' 
            and repo_name = '#{repo}' 
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
