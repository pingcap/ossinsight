require_relative './fetch_event'

class Realtime
  attr_reader :tokens, :per_page, :tokens_count

  def initialize(tokens, per_page)
    raise "You need to create github token here: https://github.com/settings/tokens, and set GITHUB_TOKEN env." if tokens.blank?
    @tokens = tokens
    @per_page = per_page
    @tokens_count = @tokens.size
  end

  def run
    loop do 
      token = tokens[rand(tokens_count)]
      begin
        FetchEvent.new(per_page, token).run
      rescue
        ActiveRecord::Base.connection.reconnect!
        puts $!
      end
    end
  end

  def self.clean!
    EventLog.where("created_at <= ?", 5.minutes.ago).delete_all
  end
end