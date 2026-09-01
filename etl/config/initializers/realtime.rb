require_relative './fetch_event'

# Polls the GitHub /events firehose and writes whatever it captures.
#
# Why it is shaped this way (all measured 2026-09-01; partition facts are in
# FetchEvent):
#
#   * The feed is an unordered sample, not a sliding window. Two requests in
#     the same instant return the same body; requests one second apart share
#     nothing. Distinct events captured therefore scale with request cadence.
#     The one collector known to capture the full stream (ClickHouse's
#     gharchive importer) polls every page twice a second, and times each
#     poll from when the request was SENT, not from when the response landed.
#   * A single sequential loop cannot get there: page 2 waits for page 1's
#     round trip and for the database write, so one process managed ~0.67
#     polls/s/page and the second copy (gh_realtime2) only lifted the pair to
#     ~1.3. That is where the measured 84% capture rate came from.
#
# So every page gets its own POLL_INTERVAL clock (PageSchedule) and a few
# sender threads that take turns on it: GitHub answers page 1 in ~0.5s but
# pages 2-3 in ~1.4s, so a single thread per page only managed 0.7 sends/s
# there (first deploy, 2026-09-01). One writer on the main Rails connection
# does deduplication and inserts. Senders never touch ActiveRecord; the
# writer never touches HTTP. The writer is the only thread that consults
# EventLog, which is what keeps the no-unique-key github_events table free
# of same-instant duplicates.
#
# Budget: 3 pages x 2 req/s = 21,600 req/h. Seven 5,000 req/h tokens give
# 35,000, so ONE process fits with ~60% headroom and two do not (43,200).
# gh_realtime2 is therefore disabled; do not start a second instance.
class Realtime
  attr_reader :tokens, :tokens_count

  # Seconds between request sends on each page, measured from the send.
  POLL_INTERVAL = 0.5
  PAGES = FetchEvent::MAX_PAGES
  # Threads sharing one page's schedule, i.e. requests that may be in flight
  # for that page at once. Covers ~2s of GitHub latency at 2 sends/s.
  SENDERS_PER_PAGE = 4
  MAX_BACKOFF_SECONDS = 60
  STATS_EVERY = 60
  # Rows per INSERT. github_events has 32 columns, so this is ~50KB of SQL.
  WRITE_SLICE = 100
  # Pages per write cycle. Bounds the id list handed to EventLog and the
  # memory held while TiDB is slow.
  MAX_PAGES_PER_WRITE = 30
  # Fetched pages waiting for the writer. When TiDB stalls, fetchers block on
  # push instead of growing memory without bound; depth is in the stats line.
  MAX_QUEUED_PAGES = 200
  # EventLog only remembers ids inserted in the last 30 minutes (see clean!),
  # but the feed re-serves events that are hours or days old: measured
  # 2026-09-01, a third of what a poll returned was over 24h old and 93% of
  # those were already in github_events. Events older than this are checked
  # against github_events itself before insert. Keep it under clean!'s
  # window so the two guards overlap.
  RECHECK_OLDER_THAN_SECONDS = 25 * 60

  def initialize(tokens, per_page)
    raise "You need to create github token here: https://github.com/settings/tokens, and set GITHUB_TOKEN env." if tokens.blank?
    @tokens = tokens
    @tokens_count = tokens.size
    # Kept for call-site compatibility; FetchEvent pins per_page itself.
    @per_page = per_page
    @lock = Mutex.new
    @cursor = 0
    # token => epoch second at which its hourly window resets.
    @exhausted_until = {}
    # Credentials GitHub refuses outright (suspended account, revoked token).
    # Never recover on their own, so dropped for the process lifetime.
    @rejected = {}
    @queue = SizedQueue.new(MAX_QUEUED_PAGES)
  end

  def run
    $stdout.sync = true
    puts "realtime: #{PAGES} pages x #{SENDERS_PER_PAGE} senders, one send per #{POLL_INTERVAL}s per page, #{tokens_count} tokens, writer on main thread"
    (1..PAGES).each do |page|
      schedule = PageSchedule.new(POLL_INTERVAL)
      stats = PageStats.new(page)
      SENDERS_PER_PAGE.times do |i|
        Thread.new do
          Thread.current.name = "poll-#{page}-#{i}"
          Thread.current.report_on_exception = true
          poll_forever(page, schedule, stats)
        end
      end
    end
    write_forever
  end

  # EventLog is the only duplicate guard. The feed re-serves events well after
  # they first appear (a single page spans days of created_at), and polling
  # six times a second sees each one more often, so keep ids longer than the
  # old five minutes. ~10k rows/min at 30 minutes is a few hundred thousand
  # rows; lookups are by primary key so size barely matters.
  def self.clean!
    EventLog.where("created_at <= ?", 30.minutes.ago).limit(100000).delete_all
  end

  private

  # One sender, forever. Every poll is independent: a failed poll is not
  # retried, the next slot on this page's schedule is the retry.
  def poll_forever(page, schedule, stats)
    loop do
      begin
        schedule.wait_for_slot
        token = checkout_token
        if token.nil?
          stats.flush_if_due(usable_token_count)
          sleep idle_wait
          next
        end

        fetcher = FetchEvent.new(FetchEvent::PER_PAGE, token)
        events = fetcher.fetch(page)
        settle_token(token, fetcher)

        if events
          stats.ok(events.map { |e| e['id'].to_i })
          @queue.push([page, events])
        else
          stats.failed
        end
        stats.flush_if_due(usable_token_count)
      rescue => e
        puts "page #{page}: #{e.class}: #{e.message}"
        sleep 1
      end
    end
  end

  # Main thread. Merges whatever the pollers have queued, dedups across pages
  # and against EventLog, inserts. One writer means the EventLog check and
  # the insert cannot race each other.
  def write_forever
    stats = WriterStats.new
    loop do
      begin
        pages = drain_queue
        events = pages.flat_map { |_, evs| evs }.uniq { |e| e['id'].to_i }
        started = monotonic
        inserted, already_stored = write_with_retry(events)
        stats.record(pages.size, events.size, inserted, already_stored, @queue.size, monotonic - started)
        stats.flush_if_due
      rescue => e
        puts "writer: #{e.class}: #{e.message}"
        sleep 1
      end
    end
  end

  def drain_queue
    pages = [@queue.pop]
    pages << @queue.pop while pages.size < MAX_PAGES_PER_WRITE && !@queue.empty?
    pages
  end

  # Returns [inserted, already_stored].
  def write(events)
    return [0, 0] if events.empty?

    ids = events.map { |e| e['id'].to_i }
    existing = EventLog.where(id: ids).pluck(:id).to_set
    fresh = events.reject { |e| existing.include?(e['id'].to_i) }
    stored = stored_keys(fresh.select { |e| older_than_window?(e) })
    fresh = fresh.reject { |e| stored.include?(stored_key(e)) } unless stored.empty?
    fresh.each_slice(WRITE_SLICE) do |es|
      EventLog.insert_all(es.map { |e| { id: e['id'], created_at: Time.now } })
      GithubEvent.insert_all(es)
    end
    [fresh.size, stored.size]
  end

  def older_than_window?(event)
    Time.iso8601(event['created_at']) < Time.now - RECHECK_OLDER_THAN_SECONDS
  rescue ArgumentError, TypeError
    true
  end

  # Events among `events` that github_events already holds, as
  # "id|created_at" keys. The id alone is NOT enough: since 2026-08 the
  # feed numbers events from a counter that currently sits in the 14.2e9
  # range and collides with real 2020-11 ids (22% of a 2026-09-01 sample
  # matched a different, six-year-old event). created_at is part of the
  # key so a colliding new event is still inserted.
  #
  # github_events is LIST-partitioned by type with a local index on id, so
  # one predicate per type lets TiDB prune each branch to a single
  # partition; UNION ALL keeps it to one round trip.
  def stored_keys(events)
    return Set.new if events.empty?

    conn = GithubEvent.connection
    sql = events.group_by { |e| e['type'] }.map do |type, es|
      "SELECT id, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') FROM github_events " \
        "WHERE type = #{conn.quote(type)} AND id IN (#{es.map { |e| e['id'].to_i }.uniq.join(',')})"
    end.join(' UNION ALL ')
    conn.select_rows(sql).map { |id, at| "#{id.to_i}|#{at}" }.to_set
  end

  # The feed's created_at is always "YYYY-MM-DDTHH:MM:SSZ", the same form
  # stored_keys asks the database for.
  def stored_key(event)
    "#{event['id'].to_i}|#{event['created_at']}"
  end

  # A dropped connection is the common failure; reconnect and try once more.
  # The retry re-checks EventLog, so slices that already landed are skipped.
  def write_with_retry(events)
    write(events)
  rescue => e
    puts "writer: #{e.class}: #{e.message}; reconnecting and retrying once"
    (ActiveRecord::Base.connection.reconnect! rescue nil)
    begin
      write(events)
    rescue => again
      puts "writer: retry failed (#{again.class}: #{again.message}); dropping #{events.size} events"
      [0, 0]
    end
  end

  # Round-robin over tokens that are neither rejected nor inside a spent
  # window, so the 6 req/s spread evenly across the pool.
  def checkout_token
    @lock.synchronize do
      now = Time.now.to_i
      tokens_count.times do
        t = tokens[@cursor]
        @cursor = (@cursor + 1) % tokens_count
        return t unless @rejected[t] || (@exhausted_until[t] || 0) > now
      end
      nil
    end
  end

  def settle_token(token, fetcher)
    @lock.synchronize do
      if fetcher.token_rejected?
        unless @rejected[token]
          @rejected[token] = true
          puts "token …#{token[-4..]} rejected by GitHub (suspended or revoked); #{tokens.count { |t| !@rejected[t] }} of #{tokens_count} still usable"
        end
      elsif fetcher.rate_limited?
        @exhausted_until[token] = Time.now.to_i + (fetcher.seconds_until_reset || MAX_BACKOFF_SECONDS)
      else
        @exhausted_until.delete(token)
      end
    end
  end

  def usable_token_count
    @lock.synchronize { tokens.count { |t| !@rejected[t] } }
  end

  def idle_wait
    if usable_token_count.zero?
      puts "FATAL: all #{tokens_count} GitHub tokens were rejected (suspended or revoked); ingestion cannot continue until they are replaced"
      return MAX_BACKOFF_SECONDS
    end
    wait = backoff_seconds
    puts "all usable tokens rate limited; sleeping #{wait}s"
    wait
  end

  # Time until the earliest token resets, clamped so a bad reset header
  # cannot stall a page for an hour.
  def backoff_seconds
    soonest = @lock.synchronize { @exhausted_until.values.min }
    return MAX_BACKOFF_SECONDS if soonest.nil?

    [[soonest - Time.now.to_i, 1].max, MAX_BACKOFF_SECONDS].min
  end

  def monotonic
    Process.clock_gettime(Process::CLOCK_MONOTONIC)
  end

  # Hands out send times INTERVAL apart to whichever sender asks next, so a
  # page is polled on a fixed cadence no matter how long each response takes.
  # If every sender is busy and the clock falls a whole interval behind, it
  # resumes from now instead of bursting to catch up (bursts are what trip
  # GitHub's secondary rate limit).
  class PageSchedule
    def initialize(interval)
      @interval = interval
      @lock = Mutex.new
      @next = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    end

    def wait_for_slot
      slot = @lock.synchronize do
        now = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        @next = now if @next < now - @interval
        taken = @next
        @next += @interval
        taken
      end
      remaining = slot - Process.clock_gettime(Process::CLOCK_MONOTONIC)
      sleep remaining if remaining > 0
      slot
    end
  end

  # Per-page counters shared by that page's senders, printed once a minute.
  # "overlap" is the share of a poll's ids that were also in the previous
  # completed poll of the same page: the only cheap signal for whether the
  # cadence keeps up with the feed (0.7 polls/s gave ~0.05, 1.7 gave 0.43).
  class PageStats
    def initialize(page)
      @page = page
      @lock = Mutex.new
      @last_flush = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      @previous_ids = []
      reset
    end

    def ok(ids)
      @lock.synchronize do
        @polls += 1
        @events += ids.size
        unless @previous_ids.empty? || ids.empty?
          @overlap_sum += (ids & @previous_ids).size.to_f / ids.size
          @overlap_n += 1
        end
        @previous_ids = ids
      end
    end

    def failed
      @lock.synchronize do
        @polls += 1
        @failures += 1
      end
    end

    def flush_if_due(usable_tokens)
      line = @lock.synchronize do
        now = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        elapsed = now - @last_flush
        next nil if elapsed < STATS_EVERY

        overlap = @overlap_n.zero? ? 'n/a' : format('%.2f', @overlap_sum / @overlap_n)
        text = format('page %d: %.2f polls/s (%d ok, %d failed), %d events, overlap with previous poll %s, usable tokens %d',
                      @page, @polls / elapsed, @polls - @failures, @failures, @events, overlap, usable_tokens)
        reset
        @last_flush = now
        text
      end
      puts line if line
    end

    private

    def reset
      @polls = 0
      @failures = 0
      @events = 0
      @overlap_sum = 0.0
      @overlap_n = 0
    end
  end

  class WriterStats
    def initialize
      @last_flush = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      reset
    end

    def record(pages, unique, inserted, already_stored, queue_depth, seconds)
      @cycles += 1
      @pages += pages
      @unique += unique
      @inserted += inserted
      @already_stored += already_stored
      @max_queue = queue_depth if queue_depth > @max_queue
      @seconds += seconds
    end

    def flush_if_due
      now = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      elapsed = now - @last_flush
      return if elapsed < STATS_EVERY

      puts format('writer: %d inserted/min (%d unique fetched from %d pages in %d cycles, %d old events already stored, %.0fms avg write, max queue %d)',
                  (@inserted * 60 / elapsed).round, @unique, @pages, @cycles, @already_stored,
                  @cycles.zero? ? 0 : @seconds * 1000 / @cycles, @max_queue)
      reset
      @last_flush = now
    end

    private

    def reset
      @cycles = 0
      @pages = 0
      @unique = 0
      @inserted = 0
      @already_stored = 0
      @max_queue = 0
      @seconds = 0.0
    end
  end
end
