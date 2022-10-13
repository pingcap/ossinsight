class TrendingRepoGenerator 
  attr_reader :limit
  def initialize(limit = 1)
    @limit = limit
  end

  def generate
    sql = <<~SQL
      select github_events.repo_name, count(distinct actor_login) as count
      from github_events 
          left join (select repo_name from trending_repos where created_at >= '#{50.days.ago.to_s(:db)}' and repo_name is not null) t on t.repo_name = github_events.repo_name
      where type = 'WatchEvent' and created_at >= '#{7.days.ago.to_s(:db)}' 
             and t.repo_name is null
      group by 1
      having count(distinct actor_login) >= 100
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