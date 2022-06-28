
return if Collection.count > 0
seed_file = Rails.root.join("db", "seed.sql").to_s
uri = URI.parse(ENV['DATABASE_URL'])
cmd = "mysql -u #{uri.user} --port=#{uri.port} --password=#{uri.password} -h #{uri.host} #{uri.path.sub('/', '')} < #{seed_file} "
puts cmd
system(cmd)