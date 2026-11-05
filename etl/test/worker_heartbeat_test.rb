require 'minitest/autorun'
require 'tmpdir'
require_relative '../lib/worker_heartbeat'

class WorkerHeartbeatTest < Minitest::Test
  def test_completed_polls_expire_and_only_private_regular_files_are_accepted
    Dir.mktmpdir do |dir|
      path = File.join(dir, 'heartbeat')
      refute WorkerHeartbeat.healthy?(path, now: 1000)
      WorkerHeartbeat.mark!(path, now: 1000)
      assert_equal 0600, File.stat(path).mode & 0777
      assert WorkerHeartbeat.healthy?(path, now: 1300)
      refute WorkerHeartbeat.healthy?(path, now: 1301)
      refute WorkerHeartbeat.healthy?(path, now: 999)
      link = File.join(dir, 'link')
      File.symlink(path, link)
      refute WorkerHeartbeat.healthy?(link, now: 1000)
      assert_raises(Errno::ELOOP) { WorkerHeartbeat.mark!(link, now: 1200) }
      assert_equal '1000', File.read(path)
      File.write(path, '1' * 100)
      refute WorkerHeartbeat.healthy?(path, now: 1000)
      refute WorkerHeartbeat.healthy?(dir, now: 1000)
    end
  end

  def test_native_workers_can_leave_container_heartbeat_disabled
    assert_nil WorkerHeartbeat.mark!(nil)
    refute WorkerHeartbeat.healthy?(nil)
  end
end
