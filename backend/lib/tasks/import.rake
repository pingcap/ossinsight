require 'open-uri'
require 'zlib'
require 'yajl'
require 'pry'
require 'json'
require 'uri'
require 'yaml'
require_relative '../importer'

namespace :gh do 
  task :set_tiflash_replica => :environment do 
    if ENV["SKIP_REPLICA"].blank?
      ActiveRecord::Base.connection.execute("ALTER TABLE github_events SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE db_repos SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE collections SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE collection_items SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE web_framework_repos SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE nocode_repos SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE static_site_generator_repos SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE web_framework_repos SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE cn_repos SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE cn_orgs SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE js_framework_repos SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE css_framework_repos SET TIFLASH REPLICA 1")
      ActiveRecord::Base.connection.execute("ALTER TABLE users SET TIFLASH REPLICA 1")
    end
  end

  task :load_sample => :environment do 
    # TODO use small sample dataset
    `cd /app/tmp && wget https://cdn.hackershare.cn/sample1m.sql.zip && unzip sample1m.sql.zip`
    uri = URI.parse(ENV['DATABASE_URL'])
    cmd = "mysql -u #{uri.user} --port=#{uri.port} --password=#{uri.password} -h #{uri.host} #{uri.path.sub('/', '')} < /app/tmp/sample-100w.sql "
    puts cmd
    system(cmd)
  end

  task :load_collection => :environment do 
    Dir.glob(Rails.root.join "meta/collections/*.yml") do |file|
      yml = YAML.load_file(file)
      collection = Collection.where(id: yml['id']).first
      if ENV['ID'].present? && (ENV['ID'] != yml['id'].to_s)
        puts "skip collectionid #{yml['id']}" 
        next
      else
        if ENV['ID'].present?
          puts "clean cache for collection #{ENV['ID']}"
          ActiveRecord::Base.connection.execute("DELETE FROM cached_table_cache WHERE cache_key LIKE '%collection-%#{ENV['ID']}%'")
        end
      end
      if collection && ENV['FORCE'].blank?
        puts "skip collection id #{yml['id']}"
        next
      end
      collection = Collection.create(id: yml['id'], name: yml['name']) if collection.nil?

      item_names = collection.collection_items.map{|x| x.repo_name}
      add_names = yml['items'] - item_names
      remove_names = item_names - yml['items']

      collection.collection_items.where(repo_name: remove_names).each {|x| x.destroy }
      add_names.each do |name|
        repo_id = GithubEvent.where(repo_name: name).order('repo_id').last&.repo_id
        next unless repo_id
        collection.collection_items.create(repo_name: name, repo_id: repo_id)
      end
      puts "collection #{collection.name} #{collection.id} created"
    end
  end

  task :load_meta => :environment do 
    db_repos = YAML.load_file(Rails.root.join("meta/repos/db_repos.yml"))
    db_repos.each do |repo|
      DbRepo.upsert(repo)
    end

    nocode_repos = YAML.load_file(Rails.root.join("meta/repos/nocode_repos.yml"))
    nocode_repos.each do |repo|
      NocodeRepo.upsert(repo)
    end

    web_framework_repos = YAML.load_file(Rails.root.join("meta/repos/web_framework_repos.yml"))
    web_framework_repos.each do |repo|
      WebFrameworkRepo.upsert(repo)
    end

    programming_language_repos = YAML.load_file(Rails.root.join("meta/repos/programming_language_repos.yml"))
    programming_language_repos.each do |repo|
      ProgrammingLanguageRepo.upsert(repo)
    end

    static_site_generator_repos = YAML.load_file(Rails.root.join("meta/repos/static_site_generator_repos.yml"))
    static_site_generator_repos.each do |repo|
      StaticSiteGeneratorRepo.upsert(repo)
    end

    js_framework_repos = YAML.load_file(Rails.root.join("meta/repos/js_framework_repos.yml"))
    js_framework_repos.each do |repo|
      JsFrameworkRepo.upsert(repo)
    end

    css_framework_repos = YAML.load_file(Rails.root.join("meta/repos/css_framework_repos.yml"))
    css_framework_repos.each do |repo|
      CssFrameworkRepo.upsert(repo)
    end

    cn_orgs = YAML.load_file(Rails.root.join("meta/orgs/cn_orgs.yml"))
    cn_orgs.each do |org|
      CnOrg.upsert(org)
    end

    puts "Sync cn_orgs -> cn_repos"

    sql = <<-SQL
      WITH tmp AS (
        SELECT repo_id, repo_name, max(cast(ge.id as unsigned)) as max_id 
          FROM github_events as ge 
               JOIN cn_orgs as co on co.id = ge.org_id
      GROUP BY repo_id, repo_name
      ORDER BY 1,2
     ), tmp1 as (
        SELECT repo_id, 
               repo_name, 
               row_number() over(partition by repo_id order by max_id desc) as c
          FROM tmp
      )

      SELECT repo_id as id, 
             repo_name as name
        FROM tmp1 
       WHERE c = 1 AND repo_id is not null 
    SQL

    results = ActiveRecord::Base.connection.select_all(sql).send(:hash_rows)
    CnRepo.upsert_all(results)

    cn_repos = YAML.load_file(Rails.root.join("meta/repos/cn_repos.yml"))
    cn_repos.each do |repo|
      CnRepo.upsert(repo)
    end
  end

  task :db_repos_csv => :environment do 
    file = "#{Rails.root}/tmp/db_repos.csv"
     
    table = DbRepo.all
     
    CSV.open(file, 'w' ) do |writer|
      writer << table.first.attributes.map { |a,v| a }
      table.each do |s|
        writer << s.attributes.map { |a,v| v }
      end
    end
  end

  task :cn_repos_csv => :environment do 
    file = "#{Rails.root}/tmp/cn_repos.csv"
     
    table = CnRepo.all
     
    CSV.open(file, 'w' ) do |writer|
      writer << table.first.attributes.map { |a,v| a }
      table.each do |s|
        writer << s.attributes.map { |a,v| v }
      end
    end
  end

  task :cn_orgs_csv => :environment do 
    file = "#{Rails.root}/tmp/cn_orgs.csv"
     
    table = CnOrg.all
     
    CSV.open(file, 'w' ) do |writer|
      writer << table.first.attributes.map { |a,v| a }
      table.each do |s|
        writer << s.attributes.map { |a,v| v }
      end
    end
  end

  task :fix_missing => :environment do 
    ["2022-02-28-16",
      "2022-02-28-14",
      "2022-02-28-5",
      "2022-02-28-1",
      "2022-02-27-22",
      "2022-02-27-12",
      "2022-02-27-8",
      "2022-02-26-19",
      "2022-02-26-0",
      "2022-02-25-12",
      "2022-02-25-7",
      "2022-02-25-4",
      "2022-02-25-3",
      "2022-02-24-15",
      "2022-02-24-11",
      "2022-02-24-1",
      "2022-02-23-17",
      "2022-02-23-15",
      "2022-02-23-0",
      "2022-02-22-21",
      "2022-02-22-18",
      "2022-02-22-14",
      "2022-02-21-22",
      "2022-02-21-21",
      "2022-02-21-10",
      "2022-02-21-7",
      "2022-02-21-4",
      "2022-02-20-17",
      "2022-02-20-7",
      "2022-02-20-3",
      "2022-02-19-18",
      "2022-02-19-16",
      "2022-02-19-9",
      "2022-02-19-5",
      "2022-02-18-22",
      "2022-02-18-0",
      "2022-02-17-11",
      "2022-02-17-5",
      "2022-02-16-23",
      "2022-02-16-22",
      "2022-02-16-19",
      "2022-02-15-23",
      "2022-02-15-22",
      "2022-02-15-20",
      "2022-02-15-18",
      "2022-02-15-13",
      "2022-02-15-10",
      "2022-02-14-19",
      "2022-02-14-12",
      "2022-02-14-10",
      "2022-02-14-5",
      "2022-02-14-3",
      "2022-02-14-0",
      "2022-02-13-23",
      "2022-02-04-10",
      "2022-02-25-1",
      "2022-01-17-18",
      "2022-01-08-16",
      "2022-01-10-13"
    ].each do |file|
      ENV['DATE'] = file.split("-")[0,3].join("-")
      ENV['HOUR'] = file.split("-")[-1]
      Rake::Task['gh:hourly'].invoke
    end
  end

  task :hourly => :environment do 
    if ENV['DATE']
      date = ENV['DATE']
    else
      current = (Time.now - 1.hour).utc
      date = current.to_date
    end

    if ENV['HOUR']
      hour = ENV['HOUR']
      hour_str = '%02d' % hour
    else
      hour = current.hour
      hour_str = '%02d' % hour
    end

    filename = "#{date}-#{hour}.json.gz"
    puts "Start import #{date.to_s}-#{hour_str} ..."
    start_time = "#{date.to_s} #{hour_str}:00:00"
    end_time   = "#{date.to_s} #{hour_str}:59:59"
    loop do
      n = GithubEvent.where(created_at: (start_time..end_time)).limit(10000).delete_all
      puts "deleted #{n} records"
      break if n < 10000
    end
    importer = Importer.new(filename)
    importer.run!
    puts "Done #{date.to_s}-#{hour_str} ..."
  end

  task :hourly_old => :environment do 
    GithubEvent.table_name = 'github_events_old'
    current = (Time.now - 1.hour).utc
    date = current.to_date
    hour = current.hour
    hour_str = '%02d' % hour
    filename = "#{date}-#{hour}.json.gz"
    puts "Start import #{date.to_s}-#{hour_str} ..."
    start_time = "#{date.to_s} #{hour_str}:00:00"
    end_time   = "#{date.to_s} #{hour_str}:59:59"
    loop do
      n = GithubEvent.where(created_at: (start_time..end_time)).limit(10000).delete_all
      puts "deleted #{n} records"
      break if n < 10000
    end
    importer = Importer.new(filename)
    importer.run!
    puts "Done #{date.to_s}-#{hour_str} ..."
  end

  task :import => :environment do
    from = ENV['FROM'] || '2021-12-17'
    to   = ENV['TO'] || (Time.now - 1.hour).utc.to_date.to_s

    (Date.parse(from)..Date.parse(to)).each do |d|
      (0..23).each do |hour|
        filename = "#{d}-#{hour}.json.gz"
        next if filename == '2016-10-21-18.json.gz'
        next if filename == "2020-03-05-22.json.gz"
        next if filename == "2020-06-10-12.json.gz"
        puts "Start import gharchive event data from #{from} to #{to} ..."

        hour_str = '%02d' % hour
        start_time = "#{d.to_s} #{hour_str}:00:00"
        end_time   = "#{d.to_s} #{hour_str}:59:59"
        loop do
          n = GithubEvent.where(created_at: (start_time..end_time)).limit(10000).delete_all
          puts "deleted #{n} records"
          break if n < 10000
        end

        importer = Importer.new(filename)
        importer.run!
      end
    end
  end
end
