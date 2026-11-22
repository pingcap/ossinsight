require 'minitest/autorun'
require 'minitest/mock'
require 'pathname'
require 'stringio'
require 'open-uri'
require 'openssl'
require 'zlib'

class ArchiveTransportTest < Minitest::Test
  def setup
    @logs = []
    logs = @logs
    context = Module.new
    context.const_set(:Rails, Struct.new(:root).new(Pathname.new('/unused-test-root')))
    import_log = Module.new
    import_log.define_singleton_method(:create!) { |**values| logs << values; Object.new }
    context.const_set(:ImportLog, import_log)
    retryable = Module.new
    retryable.define_singleton_method(:retryable) { |**_, &operation| operation.call }
    context.const_set(:Retryable, retryable)
    filename = File.expand_path('../lib/importer.rb', __dir__)
    context.module_eval(File.read(filename), filename, 1)
    @importer_class = context.const_get(:Importer)
  end

  def test_invalid_filenames_are_rejected_before_logging_or_network_access
    ['../private', 'file:///etc/passwd', '2026-11-05-24.json.gz',
     '2026-11-05-0.json.gz?redirect=http://elsewhere.invalid', "2026-11-05-0.json.gz\n"].each do |filename|
      assert_raises(ArgumentError) { @importer_class.new(filename) }
    end
    assert_empty @logs
  end

  def test_archive_download_requires_https_certificate_validation_and_no_redirects
    importer = @importer_class.new('2026-11-05-0.json.gz')
    contents = "{\"id\":\"fixture\"}\n"
    compressed = StringIO.new
    Zlib::GzipWriter.wrap(compressed) { |writer| writer.write(contents) }
    response = StringIO.new(compressed.string)
    opener = lambda do |url, **options|
      assert_equal 'https://data.gharchive.org/2026-11-05-0.json.gz', url
      assert_equal OpenSSL::SSL::VERIFY_PEER, options[:ssl_verify_mode]
      assert_equal false, options[:redirect]
      assert_equal 10, options[:open_timeout]
      assert_equal 60, options[:read_timeout]
      response
    end
    capture_io { URI.stub(:open, opener) { assert_equal contents, importer.download! } }
    assert response.closed?
  end

  def test_certificate_failures_are_not_swallowed_or_retried_over_http
    importer = @importer_class.new('2026-11-05-0.json.gz')
    calls = 0
    opener = lambda do |url, **_|
      calls += 1
      assert_equal 'https', URI.parse(url).scheme
      raise OpenSSL::SSL::SSLError, 'certificate verify failed'
    end
    capture_io { URI.stub(:open, opener) { assert_raises(OpenSSL::SSL::SSLError) { importer.download! } } }
    assert_equal 1, calls
  end

  def test_only_missing_archives_are_skipped_and_redirects_or_server_errors_fail
    [404, 500, 302].each do |status|
      importer = @importer_class.new('2026-11-05-0.json.gz')
      response = StringIO.new
      response.extend(OpenURI::Meta)
      response.status = [status.to_s, 'fixture']
      error = status == 302 ? OpenURI::HTTPRedirect.new('fixture', response, URI.parse('http://elsewhere.invalid/')) : OpenURI::HTTPError.new('fixture', response)
      capture_io do
        URI.stub(:open, ->(*_) { raise error }) do
          if status == 404
            assert_nil importer.download!
          else
            assert_raises(error.class) { importer.download! }
          end
        end
      end
    end
  end
end
