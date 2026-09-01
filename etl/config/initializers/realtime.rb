require_relative './fetch_event'

class Realtime
  attr_reader :tokens, :per_page, :tokens_count

  # The /events feed shares no event ids between polls even one second apart
  # (measured 2026-09-01), so distinct events captured scale with the request
  # budget and the hourly rate limit is the binding constraint. Each iteration
  # now costs 3 requests instead of 1 (offsets 1-300 rather than the Push-only
  # first page), so the loop must notice throttling instead of spinning on it.
  #
  # When every token is exhausted, sleep until the earliest reset rather than
  # hammering GitHub with 403s, which risks secondary rate limiting on top of
  # the primary one.
  MAX_BACKOFF_SECONDS = 60

  def initialize(tokens, per_page)
    raise "You need to create github token here: https://github.com/settings/tokens, and set GITHUB_TOKEN env." if tokens.blank?
    @tokens = tokens
    @per_page = per_page
    @tokens_count = @tokens.size
    # token => Time at which its hourly window resets, for tokens known to be spent.
    @exhausted_until = {}
  end

  def run
    loop do
      token = next_available_token
      if token.nil?
        wait = backoff_seconds
        puts "all #{tokens_count} token(s) rate limited; sleeping #{wait}s"
        sleep wait
        next
      end

      begin
        fetcher = FetchEvent.new(per_page, token)
        fetcher.run
        if fetcher.rate_limited?
          @exhausted_until[token] = Time.now.to_i + (fetcher.seconds_until_reset || MAX_BACKOFF_SECONDS)
        else
          @exhausted_until.delete(token)
        end
      rescue
        ActiveRecord::Base.connection.reconnect!
        puts $!
      end
    end
  end

  def self.clean!
    EventLog.where("created_at <= ?", 5.minutes.ago).limit(100000).delete_all
  end

  private

  # A token whose window is known to have reset, preferring an unseen one.
  def next_available_token
    now = Time.now.to_i
    available = tokens.reject { |t| (@exhausted_until[t] || 0) > now }
    return nil if available.empty?

    available[rand(available.size)]
  end

  # Time until the earliest token resets, clamped so a bad reset header cannot
  # stall ingestion for an hour.
  def backoff_seconds
    now = Time.now.to_i
    soonest = @exhausted_until.values.min
    return MAX_BACKOFF_SECONDS if soonest.nil?

    [[soonest - now, 1].max, MAX_BACKOFF_SECONDS].min
  end
end
