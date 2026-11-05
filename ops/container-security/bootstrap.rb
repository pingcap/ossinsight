require 'mysql2'
raise 'Not the isolated fixture environment' unless ENV.fetch('CONTAINER_SECURITY_TEST') == 'isolated'
client = Mysql2::Client.new(host: 'tidb', port: 4000, username: 'root', database: 'ossinsight_container_test',
                            ssl_mode: :verify_identity, sslca: '/fixtures/ca.pem', connect_timeout: 3,
                            flags: Mysql2::Client::MULTI_STATEMENTS)
client.query("SET @@tidb_multi_statement_mode='ON'")
client.query("SET @@sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'")
Dir['/fixtures/migrations/*.sql'].sort.each do |file|
  next if File.basename(file) == 'a.gharchive_dev-schema-create.sql'
  sql = File.read(file).gsub('gharchive_dev', 'ossinsight_container_test').gsub('webshelluser', 'container_reader')
  client.query(sql)
  client.store_result while client.next_result
end
client.query("CREATE USER 'etluser'@'%' IDENTIFIED BY 'etltestpassword'")
client.query("GRANT SELECT ON ossinsight_container_test.* TO 'etluser'@'%'")
%w[event_logs github_events].each do |table|
  client.query("GRANT INSERT,UPDATE ON ossinsight_container_test.#{table} TO 'etluser'@'%'")
end
client.close
puts 'fixture_schema_ready'
