require 'uri'
require 'open-uri'
require 'yajl'

class FetchEvent
  attr_reader :per_page, :url, :token

  def initialize(per_page, token)
    @per_page = per_page
    @token = token
    @base_url = 'https://api.github.com/events?per_page='
    @url = @base_url + per_page.to_s
  end

  def get_response
    resp = nil
    begin
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
  end

  def run
    json = get_response
    if json
      json = Yajl::Parser.parse(json)
      new_events = json.map do |event|
        parse_event(event)
      end

      new_event_ids = new_events.map { |e| e['id'].to_i }
      exist_event_ids = EventLog.where(id: new_event_ids).pluck(:id)
      real_events = new_events.reject{ |e| exist_event_ids.include?(e['id'].to_i) }
      
      real_events.each_slice(33) do |es|
        EventLog.insert_all(es.map{|e| {id: e['id'], created_at: Time.now}})
        GithubEvent.insert_all(es)
      end
    else
      puts "No response"
    end
  end

  def parse_event(event)
    repo_id = event.dig("repo", "id") || 0
    repo_name = event.dig("repo", "name") || ''

    language = event.dig("payload", "pull_request", "base", "repo", "language") || ''
    actor_id = event.dig("actor", 'id') || 0
    actor_login = event.dig("actor", "login") || ''
    action = event.dig("payload", "action") || ''
    additions = event.dig("payload", "pull_request", "additions") || 0
    deletions = event.dig("payload", "pull_request", "deletions") || 0
    commit_id = event.dig("payload", "comment", "commit_id") || ''
    comment_id = event.dig("payload", "comment", "id") || 0
    org_id = event.dig("org", "id") if event["org"]
    org_login = event.dig("org", "login") if event["org"]
    org_id = org_id || 0
    org_login = org_login || ''

    number = event.dig("payload", "issue", "number") || event.dig("payload", "pull_request", "number") || event.dig("payload", "number") || 0 # payload.issue.number? // .payload.pull_request.number? // .payload.number?
    
    # x.payload.pull_request.merged
    pr_merged = event.dig("payload", "pull_request", "merged") || 0

    # x.payload.[pull_request/issue].state
    state = event.dig("payload", "pull_request", "state") ||
      event.dig("payload", "issue", "state") || ''

     # x.payload.[pull_request/issue].closed_at
    closed_at = event.dig("payload", "pull_request", "closed_at") ||
      event.dig("payload", "issue", "closed_at") || '1970-01-01 00:00:00'

    # x.payload.pull_request.merged_at
    pr_merged_at = event.dig("payload", "pull_request", "merged_at") || '1970-01-01 00:00:00'

    comments = event.dig("payload", "pull_request", "comments") ||
      event.dig("payload", "issue", "comments") || 0

    pr_or_issue_id = event.dig("payload", "pull_request", "id") ||
      event.dig("payload", "issue", "id") || 0


    push_size = event.dig("payload", "size") || 0
    push_distinct_size = event.dig("payload", "distinct_size") || 0

    pr_changed_files = event.dig("payload", "pull_request", "changed_files") || 0
    pr_review_comments = event.dig("payload", "pull_request", "review_comments") || 0

    creator_user_login = event.dig("payload", "comment", "user", "login") ||
      event.dig("payload", "review", "user", "login") ||
      event.dig("payload", "issue", "user", "login") ||
      event.dig("payload", "pull_request", "user", "login") || ''

    creator_user_id = event.dig("payload", "comment", "user", "id") ||
      event.dig("payload", "review", "user", "id") ||
      event.dig("payload", "issue", "user", "id") ||
      event.dig("payload", "pull_request", "user", "id") || 0

    pr_or_issue_created_at = event.dig("payload", "issue", "created_at") ||
      event.dig("payload", "pull_request", "created_at") || '1970-01-01 00:00:00'


    date = event["created_at"].match(/((\d{4})-\d{2})-\d{2}/)
    event_day = date[0]
    event_month = [date[1], '01'].join("-")
    event_year = date[2]

    {
      "repo_id" => repo_id, 
      "repo_name" => repo_name,
      "language" => language,
      "actor_id" => actor_id,
      "actor_login" => actor_login,
      "additions" => additions,
      "deletions" => deletions,
      "action" => action,
      "commit_id" => commit_id,
      "number" => number,
      "org_id" => org_id,
      "org_login" => org_login,
      "pr_merged" => pr_merged,
      "state" => state,
      "pr_merged_at" => pr_merged_at,
      "closed_at" => closed_at,
      "comments" => comments,
      "pr_or_issue_id" => pr_or_issue_id,
      "pr_changed_files" => pr_changed_files,
      "pr_review_comments" => pr_review_comments,
      "event_day" => event_day,
      "event_month" => event_month,
      "event_year" => event_year,
      'push_size' => push_size,
      'push_distinct_size' => push_distinct_size,
      "id" => event["id"],
      "type" => event["type"],
      "created_at" => event["created_at"],
      "pr_or_issue_created_at" => pr_or_issue_created_at,
      "creator_user_id" => creator_user_id,
      "creator_user_login" => creator_user_login
    }
  end
end
