class AddMissingIndexes < ActiveRecord::Migration[6.1]
  def change
    execute("CREATE INDEX if not exists index_github_events_on_repo_id_type_number ON github_events(repo_id, type, number);")
    execute("CREATE INDEX if not exists index_github_events_on_repo_id_type_push_distinct_size ON github_events(repo_id, type, push_distinct_size);")
    execute("CREATE INDEX if not exists index_github_events_on_repo_id_type_actor_login ON github_events(repo_id, type, actor_login);")
    execute("CREATE INDEX if not exists index_github_events_on_repo_id_type_event_month ON github_events(repo_id, type, event_month);")
    execute("CREATE INDEX if not exists index_github_events_on_repo_id_type_action_month_actor_login ON github_events(repo_id, type, action, event_month, actor_login);")
    execute("CREATE INDEX if not exists index_github_events_on_actor_id_type_action_event_month ON github_events(actor_id, type, action, event_month);")
  end
end
