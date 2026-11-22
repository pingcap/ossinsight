require 'minitest/autorun'
require 'minitest/mock'
require 'pathname'
require_relative '../lib/sample_importer'

class SeedsSecurityTest < Minitest::Test
  def seed_context(count)
    context = Module.new
    context.const_set(:Rails, Struct.new(:root).new(Pathname.new(File.expand_path('..', __dir__))))
    context.const_set(:Collection, Struct.new(:count).new(count))
    context.define_singleton_method(:system) { |*_| raise 'Seed entry point must not invoke a shell' }
    filename = File.expand_path('../db/seeds.rb', __dir__)
    context.module_eval("def self.run\n#{File.read(filename)}\nend", filename, 0)
    context
  end

  def test_real_seed_entry_point_uses_private_credentials_and_verified_tls_without_force_flag
    previous = ENV.to_h.slice('DATABASE_URL', 'DB_FORCE_SSL', 'DB_SSL_CA')
    secret = "seed-secret'\"\n$(never-run)"
    ENV['DATABASE_URL'] = "mysql2://loader:#{URI.encode_www_form_component(secret)}@db.example.invalid/fixture"
    ENV.delete('DB_FORCE_SSL')
    ENV.delete('DB_SSL_CA')
    option_path = nil
    runner = lambda do |*args, **io|
      refute_includes args.join(' '), secret
      refute args.any? { |value| value.is_a?(String) && value.start_with?('--password') }
      assert_equal 'mysql', args[1]
      assert_includes args, '--ssl-mode=VERIFY_IDENTITY'
      assert_includes args, '--ssl-ca=/etc/ssl/cert.pem'
      option_path = args[2].delete_prefix('--defaults-file=')
      assert_equal 0600, File.stat(option_path).mode & 0777
      assert_equal 0700, File.stat(File.dirname(option_path)).mode & 0777
      assert_includes File.read(option_path), '$(never-run)'
      assert_equal 'a23f2caf85090d486fcb83070883b2a729e5da2c24432a0b52ce025aff770d33', Digest::SHA256.hexdigest(io.fetch(:in).read)
      true
    end
    Kernel.stub(:system, runner) { seed_context(0).run }
    refute_nil option_path
    refute File.exist?(option_path)
  ensure
    %w[DATABASE_URL DB_FORCE_SSL DB_SSL_CA].each do |key|
      previous.key?(key) ? ENV[key] = previous[key] : ENV.delete(key)
    end
  end

  def test_existing_collections_skip_seed_execution
    Kernel.stub(:system, ->(*_) { flunk 'Existing collections must not be reseeded' }) { seed_context(1).run }
  end

  def test_seed_client_failure_is_reported
    previous = ENV['DATABASE_URL']
    ENV['DATABASE_URL'] = 'mysql2://loader:fixture@db.example.invalid/fixture'
    Kernel.stub(:system, ->(*_) { false }) do
      assert_raises(RuntimeError) { seed_context(0).run }
    end
  ensure
    previous.nil? ? ENV.delete('DATABASE_URL') : ENV['DATABASE_URL'] = previous
  end
end
