class CollectionTweetGenerator 
  attr_reader :limit
  def initialize(limit = 1)
    @limit = limit
  end

  def generate
    now = Time.now 
    day_of_month = now.day
    hour = now.hour
    idx = if hour > 12
      day_of_month
    else
      day_of_month + 31
    end

    sql = <<~SQL
    select * from (
      select *,row_number() over (order by id asc) as idx 
      from collections 
      where id not in (10037,10038, 10039, 10011) 
    ) t where idx = #{idx};
    SQL

    results = ActiveRecord::Base.connection.select_all(sql)
    results.to_a.each do |r| 
      name = r['name']
      id = r['id']
      TweetCollection.new(name, id).tweet!
    end
  end
end