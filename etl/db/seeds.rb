
return if Collection.count > 0
seed_file = Rails.root.join("db", "seed.sql").to_s
uri = URI.parse(ENV['DATABASE_URL'])
if ENV['DB_FORCE_SSL'].present?
  cmd = "mysql -u #{uri.user} --port=#{uri.port} --password=#{uri.password} -h #{uri.host}  --ssl-mode=VERIFY_IDENTITY --ssl-ca=/etc/ssl/cert.pem #{uri.path.sub('/', '')} < #{seed_file} "
else
  cmd = "mysql -u #{uri.user} --port=#{uri.port} --password=#{uri.password} -h #{uri.host} #{uri.path.sub('/', '')} < #{seed_file} "
end
system(cmd)
