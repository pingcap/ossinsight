require 'minitest/autorun'
require_relative '../lib/sample_importer'

class SampleImporterTest < Minitest::Test
  def with_sample
    Tempfile.create(['sample-', '.sql']) do |file|
      file.write('SELECT 1;')
      file.flush
      yield file.path, Digest::SHA256.hexdigest('SELECT 1;')
    end
  end

  def test_password_is_private_and_never_shell_interpolated
    with_sample do |path, digest|
      option_path = nil
      secret = "p'\\\"\n$(never-run)"
      encoded = URI.encode_www_form_component(secret)
      runner = lambda do |*args, **io|
        refute_includes args.join(' '), secret
        option_path = args[2].delete_prefix('--defaults-file=')
        assert_equal 0600, File.stat(option_path).mode & 0777
        assert_equal 0700, File.stat(File.dirname(option_path)).mode & 0777
        refute File.exist?(args[0].fetch('MYSQL_TEST_LOGIN_FILE'))
        assert_includes File.read(option_path), '$(never-run)'
        assert_equal 1, File.read(option_path).scan(/^password=/).length
        assert_includes args, '--ssl-mode=VERIFY_IDENTITY'
        assert_includes args, '--local-infile=0'
        assert_includes args, '--binary-mode=1'
        assert_equal 'SELECT 1;', io[:in].read
        true
      end
      SampleImporter.run(sql_path: path, sha256: digest, database_url: "mysql2://loader:#{encoded}@db.example/test", runner: runner)
      refute File.exist?(option_path)
    end
  end

  def test_unverified_data_never_reaches_mysql
    with_sample do |path, _|
      runner = ->(*_) { flunk 'must not execute MySQL' }
      [nil, 'bad', '0' * 64].each do |digest|
        assert_raises(ArgumentError) { SampleImporter.run(sql_path: path, sha256: digest, database_url: 'mysql2://loader:pass@db.example/test', runner: runner) }
      end
    end
  end

  def test_mariadb_client_requires_certificate_and_hostname_verification
    with_sample do |path, digest|
      runner = lambda do |*args, **_|
        assert_includes args, '--ssl'
        assert_includes args, '--ssl-verify-server-cert'
        assert_includes args, '--ssl-ca=/test/ca.pem'
        refute_includes args, '--ssl-mode=VERIFY_IDENTITY'
        true
      end
      SampleImporter.run(sql_path: path, sha256: digest, database_url: 'mysql2://loader:pass@db.example/test',
                         client_flavor: 'mariadb', ssl_ca: '/test/ca.pem', runner: runner)
    end
  end

  def test_unknown_client_flavor_cannot_disable_tls
    assert_raises(ArgumentError) do
      SampleImporter.run(sql_path: '/unused', sha256: '0' * 64, database_url: 'mysql2://loader:pass@db.example/test',
                         client_flavor: 'insecure', runner: ->(*) { flunk 'must not execute client' })
    end
  end

  def test_private_file_is_removed_when_mysql_fails
    with_sample do |path, digest|
      option_path = nil
      runner = lambda do |*args, **_|
        option_path = args[2].delete_prefix('--defaults-file=')
        false
      end
      assert_raises(RuntimeError) { SampleImporter.run(sql_path: path, sha256: digest, database_url: 'mysql2://loader:pass@db.example/test', runner: runner) }
      refute File.exist?(option_path)
    end
  end

  def test_invalid_connection_errors_do_not_echo_credentials
    error = assert_raises(ArgumentError) do
      SampleImporter.run(sql_path: '/unused', sha256: '0' * 64,
                         database_url: 'mysql2://loader:private-secret@invalid host/test')
    end
    refute_includes error.full_message, 'private-secret'
    assert_nil error.cause
  end
end
