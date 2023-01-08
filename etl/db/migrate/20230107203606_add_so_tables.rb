class AddSoTables < ActiveRecord::Migration[6.1]
  def change
    # post type id
    # 1 Question
    # 2 Answer
    # 3 Wiki
    # 4 TagWikiExcerpt
    # 5 TagWiki
    # 6 ModeratorNomination
    # 7 WikiPlaceholder
    # 8 PrivilegeWiki
    execute("CREATE DATABASE IF NOT EXISTS stackoverflow")
    sql = <<~SQL
      CREATE TABLE if not exists stackoverflow.posts_questions (
        id integer NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body LONGTEXT NOT NULL,
        accepted_answer_id INTEGER,
        answer_count INTEGER NOT NULL,
        comment_count INTEGER NOT NULL,
        community_owned_date datetime,
        creation_date datetime NOT NULL,
        favorite_count INTEGER default 0,
        last_activity_date datetime,
        last_edit_date datetime,
        last_editor_display_name VARCHAR(255),
        last_editor_user_id INTEGER,
        owner_display_name VARCHAR(255),
        owner_user_id INTEGER NOT NULL,
        parent_id VARCHAR(255),
        post_type_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        tags VARCHAR(255),
        view_count INTEGER NOT NULL
      )
    SQL
    users = <<~USER
      CREATE TABLE stackoverflow.users (
        id INTEGER NOT NULL PRIMARY KEY,
        display_name VARCHAR(36) NOT NULL,
        about_me VARCHAR(5999),
        age integer,
        creation_date datetime NOT NULL,
        last_access_date datetime NOT NULL,
        location VARCHAR(100),
        reputation INTEGER NOT NULL default 0,
        up_votes INTEGER NOT NULL default 0,
        down_votes INTEGER NOT NULL default 0,
        views INTEGER NOT NULL default 0,
        profile_image_url VARCHAR(200),
        website_url VARCHAR(200)
      )
    USER

    votes = <<~VOTE
      CREATE TABLE stackoverflow.votes (
        id INTEGER NOT NULL PRIMARY KEY,
        creation_date datetime NOT NULL,
        post_id INTEGER NOT NULL,
        vote_type_id INTEGER NOT NULL
      )
    VOTE
    execute(sql)
    execute(users)
    execute(votes)
  end
end