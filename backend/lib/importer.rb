class Importer
  attr_reader :filename, :url, :cache_dir, :batch_at, :import_log, :events, :raw_events, :dump_dir

  BOOL_ATTRS = %w[pr_merged]
  EXTRACT_ATTRS = %w[
    repo_id 
    repo_name 
    actor_id 
    actor_login 
    actor_location 
    language 
    additions 
    deletions 
    action 
    number 
    commit_id 
    comment_id 
    org_login 
    org_id 
    state 
    closed_at 
    comments 
    pr_merged_at 
    pr_merged 
    pr_changed_files 
    pr_review_comments 
    pr_or_issue_id 
    event_day 
    event_month 
    author_association 
    event_year 
    push_size 
    push_distinct_size
  ]


  def initialize(filename, cache_dir = nil)
    @filename        = filename
    @cache_dir       = cache_dir || ENV['CACHE_DIR'] || Rails.root.join("cache/gharchives/").to_s
    @url             = "http://data.gharchive.org/#{filename}"
    @batch_at        = Time.now
    @import_log      = ImportLog.create!(filename: filename, start_batch_at: batch_at)
    @json_stream     = nil
    @events          = []
    @dump_dir        = ENV['DUMP_DIR'] || Rails.root.join("dumping-v3").to_s
  end

  def run!
    import_log.update(start_download_at: Time.now)
    download!
    return if @json_stream.nil?
    import_log.update(end_download_at: Time.now)
    parse!
    import_log.update(start_import_at: Time.now)
    import!
    import_log.update(end_import_at: Time.now)
  end

  def parse!
    puts "start parse json data ..."
    Yajl::Parser.parse(@json_stream) do |event|
      repo_id = event.dig("repo", "id")
      repo_name = event.dig("repo", "name")

      language = event.dig("payload", "pull_request", "base", "repo", "language")
      actor_id = event.dig("actor", 'id')
      actor_login = event.dig("actor", "login")
      actor_location = event.dig("actor", "location")
      action = event.dig("payload", "action")
      additions = event.dig("payload", "pull_request", "additions")
      deletions = event.dig("payload", "pull_request", "deletions")
      commit_id = event.dig("payload", "comment", "commit_id")
      comment_id = event.dig("payload", "comment", "id")
      org_id = event.dig("org", "id") if event["org"]
      org_login = event.dig("org", "login") if event["org"]

      number = event.dig("payload", "issue", "number") || event.dig("payload", "pull_request", "number") || event.dig("payload", "number") # payload.issue.number? // .payload.pull_request.number? // .payload.number?
      
      # x.payload.pull_request.merged
      pr_merged = event.dig("payload", "pull_request", "merged")

      # x.payload.[pull_request/issue].state
      state = event.dig("payload", "pull_request", "state") ||
        event.dig("payload", "issue", "state")

       # x.payload.[pull_request/issue].closed_at
      closed_at = event.dig("payload", "pull_request", "closed_at") ||
        event.dig("payload", "issue", "closed_at")

      # x.payload.pull_request.merged_at
      pr_merged_at = event.dig("payload", "pull_request", "merged_at") 

      comments = event.dig("payload", "pull_request", "comments") ||
        event.dig("payload", "issue", "comments")

      pr_or_issue_id = event.dig("payload", "pull_request", "id") ||
        event.dig("payload", "issue", "id")

      author_association = event.dig("payload", "comment", 'author_association') ||
        event.dig("payload", "review", 'author_association') ||
        event.dig("payload", "issue", 'author_association') ||
        event.dig("payload", "pull_request", 'author_association') 

      push_size = event.dig("payload", "size")
      push_distinct_size = event.dig("payload", "distinct_size")

      pr_changed_files = event.dig("payload", "pull_request", "changed_files")
      pr_review_comments = event.dig("payload", "pull_request", "review_comments")

      creator_user_login = event.dig("payload", "comment", "user", "login") ||
        event.dig("payload", "review", "user", "login") ||
        event.dig("payload", "issue", "user", "login") ||
        event.dig("payload", "pull_request", "user", "login")

      creator_user_id = event.dig("payload", "comment", "user", "id") ||
        event.dig("payload", "review", "user", "id") ||
        event.dig("payload", "issue", "user", "id") ||
        event.dig("payload", "pull_request", "user", "id")

      pr_or_issue_created_at = event.dig("payload", "issue", "created_at") ||
        event.dig("payload", "pull_request", "created_at")


      date = event["created_at"].match(/((\d{4})-\d{2})-\d{2}/)
      event_day = date[0]
      event_month = [date[1], '01'].join("-")
      event_year = date[2]

      @events << {
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
        "author_association" => author_association,
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

  def download!
    gz = nil
    begin
      puts "start downloading, cache miss, request url: #{url}"
      Retryable.retryable(tries: 5, on: [Timeout::Error, Net::OpenTimeout, OpenURI::HTTPError]) do
        gz = URI.open(url, open_timeout: 600, read_timeout: 600)
      end
    rescue OpenURI::HTTPError
      puts "skip 404 file: #{url}"
    else
      @json_stream = Zlib::GzipReader.new(gz).read if gz
    end
  end

  def import!
    if ENV['upsert_all']
      upsert_all
    elsif ENV['insert_all']
      insert_all
    else
      insert_all
    end
  end

  def upsert_all
    puts "start insert #{events.count} records into DB using upsert_all ..."
    events.each_slice(3000) do |es|
      puts 'bulk insert 3000 records'
      GithubEvent.upsert_all(es)
    end
  end

  def insert_all
    puts "start insert #{events.count} records into DB using insert_all ..."
    events.each_slice(3000) do |es|
      puts 'bulk insert 3000 records'
      GithubEvent.insert_all(es)
    end
  end
end