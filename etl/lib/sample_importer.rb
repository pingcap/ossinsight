require 'digest'
require 'tempfile'
require 'tmpdir'
require 'uri'

# Import only an operator-approved local SQL file, never an unverified archive.
module SampleImporter
  def self.run(sql_path:, sha256:, database_url:, ssl_ca: nil, runner: Kernel.method(:system),
               client_flavor: ENV.fetch('SAMPLE_MYSQL_CLIENT_FLAVOR', 'mysql'))
    tls_options = case client_flavor
                  when 'mysql' then ['--ssl-mode=VERIFY_IDENTITY']
                  when 'mariadb' then ['--ssl', '--ssl-verify-server-cert']
                  else raise ArgumentError, 'Unsupported sample import client'
                  end
    raise ArgumentError, 'SAMPLE_SQL_SHA256 must be an independently verified SHA-256 digest' unless /\A[0-9a-f]{64}\z/i.match?(sha256.to_s)
    uri = URI.parse(database_url)
    database = uri.path.sub(%r{\A/}, '')
    unless %w[mysql mysql2].include?(uri.scheme) && uri.host && uri.user && /\A[A-Za-z0-9_$-]{1,64}\z/.match?(database)
      raise ArgumentError, 'A complete MySQL DATABASE_URL is required'
    end

    File.open(sql_path, File::RDONLY | File::NOFOLLOW | File::NONBLOCK) do |sql|
      raise ArgumentError, 'Sample must be a regular local SQL file' unless sql.stat.file?
      digest = Digest::SHA256.new
      while (chunk = sql.read(1024 * 1024))
        digest.update(chunk)
      end
      raise ArgumentError, 'Sample checksum mismatch' unless digest.hexdigest == sha256.downcase
      sql.rewind

      # A private option file keeps credentials out of argv, shell expansion and logs.
      Dir.mktmpdir('ossinsight-import-') do |client_dir|
        Tempfile.create(['client-', '.cnf'], client_dir) do |options|
          options.chmod(0600)
          options.write("[client]\n")
          values = { 'user' => URI::DEFAULT_PARSER.unescape(uri.user),
                     'password' => URI::DEFAULT_PARSER.unescape(uri.password.to_s),
                     'host' => uri.host, 'port' => uri.port || 3306, 'database' => database }
          values.each { |key, value| options.write("#{key}=#{option_value(value)}\n") }
          options.flush
          args = ['mysql', "--defaults-file=#{options.path}", '--protocol=TCP',
                  *tls_options, '--local-infile=0', '--binary-mode=1', '--connect-timeout=10']
          args << "--ssl-ca=#{ssl_ca}" if ssl_ca && !ssl_ca.empty?
          raise 'Sample import failed' unless runner.call({ 'MYSQL_TEST_LOGIN_FILE' => File.join(client_dir, 'unused-login.cnf'),
                        'MYSQL_PWD' => nil, 'DATABASE_URL' => nil }, *args, in: sql)
        end
      end
    end
  rescue URI::InvalidURIError
    raise ArgumentError, 'Invalid DATABASE_URL', cause: nil
  end

  def self.option_value(value)
    raise ArgumentError, 'MySQL option values cannot contain NUL' if value.to_s.include?("\0")
    escapes = { "\\" => "\\\\", '"' => '\\"', "\n" => '\\n', "\r" => '\\r', "\t" => '\\t', "\b" => '\\b' }
    '"' + value.to_s.gsub(/[\\"\n\r\t\b]/) { |c| escapes.fetch(c) } + '"'
  end
  private_class_method :option_value
end
