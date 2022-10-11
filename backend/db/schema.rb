# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_12_14_161151) do

  create_table "cn_orgs", id: :string, charset: "utf8mb4", collation: "utf8mb4_bin", force: :cascade do |t|
    t.string "name"
    t.string "company"
  end

  create_table "cn_repos", id: :string, charset: "utf8mb4", collation: "utf8mb4_bin", force: :cascade do |t|
    t.string "name"
    t.string "company"
  end

  create_table "db_repos", id: :string, charset: "utf8mb4", collation: "utf8mb4_bin", force: :cascade do |t|
    t.string "name"
  end

  create_table "github_events", id: false, charset: "utf8mb4", collation: "utf8mb4_bin", force: :cascade do |t|
    t.bigint "id"
    t.string "type"
    t.datetime "created_at"
    t.bigint "repo_id"
    t.string "repo_name"
    t.bigint "actor_id"
    t.string "actor_login"
    t.string "actor_location"
    t.string "language"
    t.bigint "additions"
    t.bigint "deletions"
    t.string "action"
    t.integer "number"
    t.string "commit_id"
    t.bigint "comment_id"
    t.string "org_login"
    t.bigint "org_id"
    t.string "state"
    t.datetime "closed_at"
    t.integer "comments"
    t.datetime "pr_merged_at"
    t.boolean "pr_merged"
    t.integer "pr_changed_files"
    t.integer "pr_review_comments"
    t.bigint "pr_or_issue_id"
    t.date "event_day"
    t.date "event_month"
    t.string "author_association"
    t.integer "event_year"
    t.integer "push_size"
    t.integer "push_distinct_size"
    t.index ["action"], name: "index_github_events_on_action"
    t.index ["actor_id"], name: "index_github_events_on_actor_id"
    t.index ["actor_login"], name: "index_github_events_on_actor_login"
    t.index ["additions"], name: "index_github_events_on_additions"
    t.index ["closed_at"], name: "index_github_events_on_closed_at"
    t.index ["comment_id"], name: "index_github_events_on_comment_id"
    t.index ["comments"], name: "index_github_events_on_comments"
    t.index ["commit_id"], name: "index_github_events_on_commit_id"
    t.index ["created_at"], name: "index_github_events_on_created_at"
    t.index ["deletions"], name: "index_github_events_on_deletions"
    t.index ["event_day"], name: "index_github_events_on_event_day"
    t.index ["event_month"], name: "index_github_events_on_event_month"
    t.index ["event_year"], name: "index_github_events_on_event_year"
    t.index ["id"], name: "index_github_events_on_id"
    t.index ["language"], name: "index_github_events_on_language"
    t.index ["org_id"], name: "index_github_events_on_org_id"
    t.index ["org_login"], name: "index_github_events_on_org_login"
    t.index ["pr_changed_files"], name: "index_github_events_on_pr_changed_files"
    t.index ["pr_merged_at"], name: "index_github_events_on_pr_merged_at"
    t.index ["pr_or_issue_id"], name: "index_github_events_on_pr_or_issue_id"
    t.index ["pr_review_comments"], name: "index_github_events_on_pr_review_comments"
    t.index ["repo_id"], name: "index_github_events_on_repo_id"
    t.index ["repo_name"], name: "index_github_events_on_repo_name"
    t.index ["type"], name: "index_github_events_on_type"
  end

  create_table "import_logs", charset: "utf8mb4", collation: "utf8mb4_bin", force: :cascade do |t|
    t.string "filename", null: false
    t.string "local_file"
    t.datetime "start_download_at"
    t.datetime "end_download_at"
    t.datetime "start_import_at"
    t.datetime "end_import_at"
    t.datetime "start_batch_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["filename"], name: "index_import_logs_on_filename"
  end

  create_table "users", id: :integer, charset: "utf8mb4", collation: "utf8mb4_bin", force: :cascade do |t|
    t.string "login", null: false
    t.string "company"
    t.timestamp "created_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.string "type", default: "USR", null: false
    t.boolean "fake", default: false, null: false
    t.boolean "deleted", default: false, null: false
    t.decimal "long", precision: 11, scale: 8
    t.decimal "lat", precision: 10, scale: 8
    t.string "country_code", limit: 3
    t.string "state"
    t.string "city"
    t.string "location"
    t.index ["login"], name: "index_login_on_users"
  end

end
