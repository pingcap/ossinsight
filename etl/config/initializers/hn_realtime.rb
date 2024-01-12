require_relative './hn_fetch_item'
require_relative './hn_fetch_user'
require_relative './hn_update'

class HnRealtime
  attr_reader :interval, :from

  def initialize(interval = 10, from = 30000000)
    @interval = interval
    @from = from
  end

  def run
    loop do 
      last_id_in_db = HnItem.maximum(:id).to_i
      last_id_in_db = from if last_id_in_db == 0
      puts "last_id_in_db -> #{last_id_in_db}"
      last_id_remote = self.class.current_last_id
      puts "last_id_remote -> #{last_id_remote}"
      begin
        if (last_id_in_db != 0 && last_id_remote != 0) && last_id_in_db < last_id_remote
          (last_id_in_db..last_id_remote).each do |item_id|
            puts "Fetch item -> #{item_id}"
            HnFetchItem.new(item_id).run
          end
        end
        puts "Update recently changed items and users"
        HnUpdate.new.run
      rescue
        ActiveRecord::Base.connection.reconnect!
        puts $!
      end
      sleep(interval)
    end
  end

  def self.current_last_id 
    URI.open("https://hacker-news.firebaseio.com/v0/maxitem.json").read.to_i
  end
end