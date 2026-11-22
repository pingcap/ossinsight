# A completed ingestion poll (or an expected rate-limit wait) advances this
# timestamp. Persistent failures and rejected credentials let it expire.
module WorkerHeartbeat
  def self.mark!(path = ENV['ETL_HEARTBEAT_PATH'], now: Time.now.to_i)
    return if path.nil? || path.empty?

    File.open(path, File::WRONLY | File::CREAT | File::TRUNC | File::NOFOLLOW, 0600) do |file|
      file.write(now.to_s)
    end
  end

  def self.healthy?(path = ENV['ETL_HEARTBEAT_PATH'], now: Time.now.to_i)
    return false if path.nil? || path.empty?

    File.open(path, File::RDONLY | File::NONBLOCK | File::NOFOLLOW) do |file|
      return false unless file.stat.file?
      value = file.read(33)
      return false unless /\A\d{1,12}\z/.match?(value)
      (0..300).cover?(now - value.to_i)
    end
  rescue SystemCallError, IOError
    false
  end
end
