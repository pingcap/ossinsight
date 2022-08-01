class TrendingRepoGenerator 
  attr_reader :limit
  def initialize(limit = 1)
    @limit = limit
  end

  def generate
    sql = <<~SQL
      select repo_name, count(*) as count
      from github_events
      where type = 'WatchEvent' and created_at >= '#{7.days.ago.to_s(:db)}'
            and repo_name not in (select repo_name from trending_repos where repo_name is not null)
      group by 1
      having count(*) >= 500
      order by 2 desc
      limit #{limit}
    SQL

    results = ActiveRecord::Base.connection.select_all(sql)
    results.to_a.each do |r| 
      repo = r['repo_name']
      TweetRepo.new(repo).tweet! 
      TrendingRepo.create!(repo_name: repo)
    end
  end
end