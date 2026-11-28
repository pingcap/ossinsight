require 'net/http'
require 'open-uri'
require 'retryable'

module StackExchangeTransport
  def self.get(url)
    response = Retryable.retryable(tries: 5, on: [Timeout::Error, Net::OpenTimeout, OpenURI::HTTPError]) do
      URI.open(url, open_timeout: 600, read_timeout: 600, 'user-agent' => 'ossinsight.io')
    end
    response.read
  rescue OpenURI::HTTPError => error
    puts "Stack Exchange returned HTTP #{error.io.status.first.to_i}"
    nil
  end
end
