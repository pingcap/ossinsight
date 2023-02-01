class FillWatchEvent
  attr_reader :repo, :per_page

  def initialize(repo, per_page = 30)
    @repo = repo
    @per_page = per_page
  end

  def fill
    repo_item = GithubEvent.where(type: 'WatchEvent', repo_name: repo).order(:id).last
    org_login = repo_item.org_login
    org_id = repo_item.org_id 
    repo_id = repo_item.repo_id
    page = 1
    loop do 
      url = "https://api.github.com/repos/#{repo}/stargazers?per_page=#{per_page}&page=#{page}"
      token = generate_token
      resp = get_response(url, token)
      json = JSON.parse(resp)
      json.each do |item|
        starred_at = item["starred_at"]
        actor_login = item.dig("user", "login")
        actor_id = item.dig("user", "id")
        db_item = GithubEvent.where(
          actor_id: actor_id, repo_id: repo_id,
          type: "WatchEvent"
        ).first 
        if db_item.nil? 
          date = starred_at.match(/((\d{4})-\d{2})-\d{2}/)
          event_day = date[0]
          event_month = [date[1], '01'].join("-")
          event_year = date[2]
          attrs = {
            type: "WatchEvent",
            actor_login: actor_login,
            actor_id: actor_id,
            created_at: starred_at,
            repo_name: repo,
            repo_id: repo_id,
            org_id: org_id,
            org_login: org_login,
            event_year: event_year,
            event_month: event_month,
            event_day: event_day,
            action: 'started'
          }
          puts(attrs)
          GithubEvent.create!(attrs)
        end
      end
      if json.size < per_page
        puts json
        puts "end of page: #{page}"
        break
      end
      page = page + 1
    end
  end

  def generate_token
    tokens = ENV["GITHUB_TOKEN"].split(",")
    token_size = tokens.size 
    token = tokens[rand(token_size)]
    token
  end

  def get_response(url, token)
    puts url
    resp = nil
    begin
      Retryable.retryable(tries: 5, on: [Timeout::Error, Net::OpenTimeout, OpenURI::HTTPError]) do
        resp = URI.open(url, 
          open_timeout: 600, 
          read_timeout: 600,
          'user-agent' => 'ossinsight.io',
          'accept' => 'application/vnd.github.v3.star+json',
          'Authorization' => 'token ' + token
        )
      end
    rescue OpenURI::HTTPError
      puts "skip 404 file: #{url}"
    else
      resp&.read
    end
  end
end