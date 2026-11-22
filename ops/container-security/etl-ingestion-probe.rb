require 'json'
raise 'Not the isolated fixture database' unless ENV.fetch('CONTAINER_SECURITY_TEST') == 'isolated' &&
  ActiveRecord::Base.connection_db_config.database == 'ossinsight_container_test'
connection = ActiveRecord::Base.connection
raise 'Rails connection is not encrypted' if connection.select_rows("SHOW SESSION STATUS LIKE 'Ssl_cipher'").first.last.empty?

class FixtureFetch < FetchEvent
  def get_response(page)
    events = [page, page + 1].map do |id|
      { 'id' => id.to_s, 'type' => 'WatchEvent', 'created_at' => '2026-01-02T03:04:05Z',
        'repo' => { 'id' => 42, 'name' => 'security-fixture/repository' },
        'actor' => { 'id' => 43, 'login' => 'security-fixture' }, 'payload' => { 'action' => 'started' } }
    end
    JSON.generate(events)
  end
end
2.times do
  fetcher = FixtureFetch.new(100, 'synthetic-unused-token')
  fetcher.run
  raise 'Completed poll was not recorded' unless fetcher.completed_poll
end
raise 'Intra-poll or repeated-poll duplicates were inserted' unless GithubEvent.count == 4 && EventLog.count == 4
raise 'Event parsing changed' unless GithubEvent.where(type: 'WatchEvent', repo_name: 'security-fixture/repository').count == 4
class FailedFixtureFetch < FetchEvent
  def get_response(_page)
    nil
  end
end
failed = FailedFixtureFetch.new(100, 'synthetic-unused-token')
failed.run
raise 'Failed poll was marked successful' if failed.completed_poll
schema = Object.new.extend(SchemaDumpingHelper).dump_table_schema('event_logs')
raise 'Schema dump failed after adapter upgrade' unless schema.include?('event_logs')
raise 'Schema dump included unrelated tables' if schema.include?('create_table "github_events"')
WorkerHeartbeat.mark!
raise 'Worker heartbeat was not healthy' unless WorkerHeartbeat.healthy?
puts JSON.generate({rails: Rails.version, adapter: connection.adapter_name, encrypted: true,
                    rows: GithubEvent.count, repeatedPollDeduplicated: true, schemaDump: true, heartbeat: true})
