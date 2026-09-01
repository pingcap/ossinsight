class Importer
  attr_reader :filename, :url, :cache_dir, :batch_at, :import_log, :events, :raw_events, :dump_dir

  BOOL_ATTRS = %w[pr_merged]
  EXTRACT_ATTRS = %w[
    repo_id 
    repo_name 
    actor_id 
    actor_login 
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

  # Default is insert_missing: the live poller (Realtime) already holds most
  # of every hour, and since 2026-09-01 nothing may delete or blindly re-add
  # what it captured. insert_all / upsert_all remain for loading a range
  # that is known to be empty.
  def import!
    if ENV['upsert_all']
      upsert_all
    elsif ENV['insert_all']
      insert_all
    else
      insert_missing
    end
  end

  # Ids per lookup query; ~1k keeps each IN list small enough to stay an
  # index lookup on one partition.
  LOOKUP_CHUNK = 1000
  INSERT_SLICE = 10000

  # Insert only the archive events github_events does not already hold, and
  # say how many it did: that ratio is a direct measurement of the live
  # poller's capture rate against an independent reader of the same feed.
  def insert_missing
    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    existing = existing_keys(events)
    missing = events.reject { |e| existing.include?(event_key(e)) }
    missing.each_slice(INSERT_SLICE) { |es| GithubEvent.insert_all(es) }
    elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started
    captured = events.count - missing.count
    pct = events.count.zero? ? 0.0 : captured * 100.0 / events.count
    puts format('archive %s: %d events, %d already captured live (%.1f%%), inserted %d in %.1fs',
                filename, events.count, captured, pct, missing.count, elapsed)
  end

  # "id|created_at" keys of the given events that github_events already
  # holds. The id alone is NOT enough: since 2026-08 the /events feed numbers
  # events from a counter that collides with real 2020 ids, so a matching id
  # may be a different, six-year-old event. github_events is LIST-partitioned
  # by type, so one query per type prunes to a single partition.
  def existing_keys(events)
    conn = GithubEvent.connection
    keys = Set.new
    events.group_by { |e| e['type'] }.each do |type, es|
      es.map { |e| e['id'].to_i }.uniq.each_slice(LOOKUP_CHUNK) do |ids|
        sql = "SELECT id, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') FROM github_events " \
              "WHERE type = #{conn.quote(type)} AND id IN (#{ids.join(',')})"
        conn.select_rows(sql).each { |id, at| keys << "#{id.to_i}|#{at}" }
      end
    end
    keys
  end

  # Same form existing_keys asks the database for. Archive timestamps are
  # already "YYYY-MM-DDTHH:MM:SSZ"; the parse guards against a variant.
  def event_key(event)
    at = begin
      Time.iso8601(event['created_at']).utc.strftime('%Y-%m-%dT%H:%M:%SZ')
    rescue ArgumentError, TypeError
      event['created_at']
    end
    "#{event['id'].to_i}|#{at}"
  end

  def upsert_all
    puts "start insert #{events.count} records into DB using upsert_all ..."
    events.each_slice(90000) do |es|
      puts 'bulk insert 90000 records'
      GithubEvent.upsert_all(es)
    end
  end

  def insert_all
    puts "start insert #{events.count} records into DB using insert_all ..."
    events.each_slice(90000) do |es|
      puts 'bulk insert 90000 records'
      GithubEvent.insert_all(es)
    end
  end
end
