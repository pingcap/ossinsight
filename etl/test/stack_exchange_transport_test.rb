require 'minitest/autorun'
require 'stringio'
require_relative '../lib/stack_exchange_transport'

class StackExchangeTransportTest < Minitest::Test
  def test_reads_the_successful_response
    URI.stub(:open, StringIO.new('fixture response')) do
      assert_equal 'fixture response', StackExchangeTransport.get('https://example.invalid/questions')
    end
  end

  def test_logs_only_the_http_status
    io = StringIO.new('fixture body')
    io.extend(OpenURI::Meta)
    io.status = ['404', 'unused fixture text']
    error = OpenURI::HTTPError.new('fixture request detail', io)
    output, = capture_io do
      Retryable.stub(:retryable, ->(*) { raise error }) do
        assert_nil StackExchangeTransport.get('https://example.invalid/questions?key=fixture')
      end
    end
    assert_equal "Stack Exchange returned HTTP 404\n", output
  end
end
