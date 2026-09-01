require 'uri'
require 'open-uri'
require 'yajl'

class FetchEvent
  # Since ~2025-05-23 GitHub partitions the /events firehose BY POSITION
  # (https://github.com/igrigorik/gharchive.org/issues/310):
  #   - offsets 1-100 (page 1 at per_page=100) are a ~97% PushEvent block;
  #   - the healthy event mix lives ONLY at offsets 101-300 (pages 2-3);
  #   - the window is hard-capped at 300 items (page 4 errors out);
  #   - per_page values over 100 are silently clamped to 100;
  #   - the DEFAULT per_page=30 would put pages 1-3 entirely inside the
  #     Push-only offset 1-100 partition.
  # Both query params MUST therefore be explicit: per_page=100 and page=1..3.
  # Anything else either misses the healthy mix or fetches nothing extra.
  #
  # Measured 2026-09-01: the feed is NOT a stable "latest 300 events" window.
  # Two requests issued in the same instant return identical bodies, but
  # requests even one second apart share ZERO event ids, and a single page can
  # span more than a week of created_at values. Consequently there is no poll
  # cadence that achieves complete capture, and no diminishing return from
  # polling faster: distinct events recovered scale with the request budget.
  # That makes the rate limit the binding constraint, so the poller tracks it
  # explicitly (see rate_limit_remaining) instead of spinning into 403s.
  PER_PAGE = 100
  MAX_PAGES = 3

  # Stop fetching for this iteration when the token's hourly budget is nearly
  # gone, leaving room for the other pages and for Realtime to rotate tokens.
  RATE_LIMIT_FLOOR = 50

  attr_reader :per_page, :token, :rate_limit_remaining, :rate_limit_reset_at

  # The per_page argument is kept for call-site compatibility (Realtime passes
  # start.sh's value through) but is pinned to PER_PAGE regardless — see the
  # partition note above: any other value silently loses the healthy event mix.
  def initialize(per_page, token)
    @per_page = PER_PAGE
    @token = token
    @rate_limit_remaining = nil
    @rate_limit_reset_at = nil
    @token_rejected = false
  end

  # True when GitHub refused the credential itself rather than throttling it:
  # a suspended account or a revoked token 403/401s on every request forever,
  # so leaving it in rotation silently costs that share of every poll.
  def token_rejected?
    @token_rejected
  end

  # True when this token has (almost) no hourly budget left. Realtime uses it
  # to back off rather than burn the loop on 403s.
  def rate_limited?
    !rate_limit_remaining.nil? && rate_limit_remaining <= RATE_LIMIT_FLOOR
  end

  # Seconds until this token's window resets, or nil when unknown.
  def seconds_until_reset
    return nil unless rate_limit_reset_at
    [(rate_limit_reset_at - Time.now.to_i), 0].max
  end

  def url_for(page)
    "https://api.github.com/events?per_page=#{per_page}&page=#{page}"
  end

  def get_response(page)
    url = url_for(page)
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
    rescue OpenURI::HTTPError => e
      # e.message is the real status line (e.g. "403 Forbidden"). This used to
      # print "skip 404 file" for ANY HTTP error, which hid rate limits and
      # suspended accounts behind a fake 404 for months. The body carries the
      # actual reason and is the only way to tell "slow down" from "this
      # credential is dead".
      status = e.message.strip
      body = (e.io.read.gsub(/\s+/, ' ')[0, 300] rescue '<unreadable>')
      remaining = (e.io.meta['x-ratelimit-remaining'] rescue nil)

      # Distinguish "this credential is dead" from "slow down". A suspended
      # account 403s with NO x-ratelimit-* headers at all, so the budget cannot
      # be used to tell them apart — the body is the only signal. Retrying a
      # dead credential is pointless; it must leave the rotation.
      budget_exhausted = !remaining.nil? && !remaining.to_s.empty? && remaining.to_i.zero?
      throttled = budget_exhausted ||
        body.include?('rate limit') ||
        body.include?('abuse') ||
        body.include?('secondary')
      @token_rejected = status.start_with?('401') ||
        (status.start_with?('403') && !throttled)

      puts "HTTP error (#{status}) fetching #{url} | remaining=#{remaining} | body=#{body}"
      nil
    rescue Timeout::Error, Net::OpenTimeout => e
      # Contain post-retry timeouts per page so one bad page does not discard
      # the events already fetched from the other pages this iteration.
      puts "#{e.class} after retries fetching #{url}"
      nil
    else
      record_rate_limit(resp)
      resp&.read
    end
  end

  # GitHub returns the budget on every response; without reading it the poller
  # cannot tell "no new events" from "we are being throttled".
  def record_rate_limit(resp)
    meta = resp&.meta
    return unless meta

    remaining = meta['x-ratelimit-remaining']
    reset = meta['x-ratelimit-reset']
    @rate_limit_remaining = remaining.to_i if remaining
    @rate_limit_reset_at = reset.to_i if reset
  end

  def run
    new_events = []
    fetched_pages = []
    (1..MAX_PAGES).each do |page|
      if rate_limited?
        puts "rate limit nearly exhausted (#{rate_limit_remaining} left, resets in #{seconds_until_reset}s); skipping pages #{page}-#{MAX_PAGES} this iteration"
        break
      end

      json = get_response(page)
      next unless json

      new_events.concat(Yajl::Parser.parse(json).map { |event| parse_event(event) })
      fetched_pages << page
    end

    if fetched_pages.empty?
      puts "No response (all #{MAX_PAGES} pages failed)"
      return
    end
    if fetched_pages.size < MAX_PAGES
      puts "degraded fetch: only page(s) #{fetched_pages.join(',')} of #{MAX_PAGES} succeeded"
    end

    # Intra-batch dedup is REQUIRED before the EventLog check: the firehose
    # shifts between the three page requests, so the same event id can appear
    # on two pages, and github_events has NO primary/unique key — a duplicate
    # that survives to insert_all is inserted twice. EventLog's PK only guards
    # against ids seen in PREVIOUS runs, not within this merged batch.
    new_events = new_events.uniq { |e| e['id'].to_i }

    new_event_ids = new_events.map { |e| e['id'].to_i }
    exist_event_ids = EventLog.where(id: new_event_ids).pluck(:id)
    real_events = new_events.reject{ |e| exist_event_ids.include?(e['id'].to_i) }

    real_events.each_slice(33) do |es|
      EventLog.insert_all(es.map{|e| {id: e['id'], created_at: Time.now}})
      GithubEvent.insert_all(es)
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
