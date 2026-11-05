require 'json'
require 'mysql2'
require 'digest'
require 'open3'
require '/app/lib/sample_importer'

raise 'Fixtures must use the isolated Docker network' unless ENV.fetch('CONTAINER_SECURITY_TEST') == 'isolated'
ca = '/fixtures/ca.pem'
options = { host: 'tidb', port: 4000, username: 'root', password: '', ssl_mode: :verify_identity,
            sslca: ca, connect_timeout: 3, read_timeout: 5, write_timeout: 5 }
client = nil
60.times do
  begin
    client = Mysql2::Client.new(**options)
    break
  rescue Mysql2::Error
    sleep 1
  end
end
raise 'TiDB TLS readiness failed' unless client
raise 'TLS was not negotiated' if client.query("SHOW SESSION STATUS LIKE 'Ssl_cipher'").first.fetch('Value').empty?
client.query('CREATE DATABASE ossinsight_container_test')
client.query('CREATE TABLE ossinsight_container_test.import_probe (id BIGINT PRIMARY KEY)')
client.close

plain = Mysql2::Client.new(**options.merge(host: 'tidb-plain', ssl_mode: :disabled))
plain.query('CREATE DATABASE ossinsight_container_test')
plain.close

checks = []
[{host: 'tidb-wrong'}, {sslca: '/fixtures/wrong-ca.pem'}, {host: 'tidb-plain'}].each do |changes|
  begin
    connection = Mysql2::Client.new(**options.merge(changes))
    connection.close
    raise "mysql2 accepted an insecure connection: #{changes.keys.join(',')}"
  rescue Mysql2::Error => error
    raise unless error.error_number == 2026
    checks << 'mysql2_rejected_' + changes.keys.join('_') + (changes[:host] || '')
  end
end

sql = '/tmp/import-probe.sql'
File.write(sql, 'INSERT INTO import_probe (id) VALUES (1);')
digest = Digest::SHA256.file(sql).hexdigest
SampleImporter.run(sql_path: sql, sha256: digest, database_url: 'mysql2://root:@tidb:4000/ossinsight_container_test', ssl_ca: ca)
client = Mysql2::Client.new(**options, database: 'ossinsight_container_test')
raise 'Sample import did not execute' unless client.query('SELECT COUNT(*) AS n FROM import_probe').first.fetch('n') == 1
client.close
File.write(sql, 'SELECT 1;')
digest = Digest::SHA256.hexdigest('SELECT 1;')
[{host: 'tidb-wrong', ca: ca}, {host: 'tidb', ca: '/fixtures/wrong-ca.pem'}, {host: 'tidb-plain', ca: ca}].each do |bad|
  client_error = nil
  runner = lambda do |*args, **io|
    _output, client_error, status = Open3.capture3(*args, stdin_data: io.fetch(:in).read)
    status.success?
  end
  begin
    SampleImporter.run(sql_path: sql, sha256: digest,
                       database_url: "mysql2://root:@#{bad.fetch(:host)}:4000/ossinsight_container_test", ssl_ca: bad.fetch(:ca), runner: runner)
    raise 'CLI accepted an insecure connection'
  rescue RuntimeError => error
    raise unless error.message == 'Sample import failed'
    raise 'Failure was unrelated to TLS verification' unless client_error.to_s.include?('ERROR 2026')
    checks << 'cli_rejected_' + bad.fetch(:host)
  end
end
puts JSON.generate({mysql2: Gem.loaded_specs.fetch('mysql2').version.to_s, encrypted: true, sampleImported: true, negativeChecks: checks.length})
