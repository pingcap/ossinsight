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
    questions = <<~SQL
      CREATE TABLE if not exists stackoverflow.questions (
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
        parent_id integer,
        post_type_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        tags VARCHAR(255),
        view_count INTEGER NOT NULL
      )
    SQL
    users = <<~USER
      CREATE TABLE if not exists stackoverflow.users (
        id INTEGER NOT NULL PRIMARY KEY,
        display_name VARCHAR(90) NOT NULL,
        about_me VARCHAR(5999),
        age integer,
        creation_date datetime NOT NULL,
        last_access_date datetime NOT NULL,
        location VARCHAR(296),
        reputation INTEGER NOT NULL default 0,
        up_votes INTEGER NOT NULL default 0,
        down_votes INTEGER NOT NULL default 0,
        views INTEGER NOT NULL default 0,
        profile_image_url VARCHAR(200),
        website_url VARCHAR(200)
      )
    USER

    votes = <<~VOTE
      CREATE TABLE if not exists stackoverflow.votes (
        id INTEGER NOT NULL PRIMARY KEY,
        creation_date datetime NOT NULL,
        post_id INTEGER NOT NULL,
        vote_type_id INTEGER NOT NULL
      )
    VOTE

    answers = <<~ANSWER
      CREATE TABLE if not exists stackoverflow.answers (
        id integer NOT NULL PRIMARY KEY,
        title VARCHAR(255),
        body LONGTEXT NOT NULL,
        accepted_answer_id INTEGER,
        answer_count INTEGER,
        comment_count INTEGER NOT NULL,
        community_owned_date datetime,
        creation_date datetime NOT NULL,
        favorite_count INTEGER default 0,
        last_activity_date datetime,
        last_edit_date datetime,
        last_editor_display_name VARCHAR(255),
        last_editor_user_id INTEGER,
        owner_display_name VARCHAR(255),
        owner_user_id INTEGER,
        parent_id integer not null,
        post_type_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        tags VARCHAR(255),
        view_count INTEGER
      )
    ANSWER

    tags =<<~TAG
      CREATE TABLE if not exists stackoverflow.tags (
        id INTEGER NOT NULL PRIMARY KEY,
        tag_name VARCHAR(35) NOT NULL,
        count INTEGER NOT NULL default 0,
        last_activity_date datetime default '1970-01-01 00:00:00'
      )
    TAG

    comments =<<~COMMENT
      CREATE TABLE if not exists stackoverflow.comments (
        id INTEGER NOT NULL PRIMARY KEY,
        text text NOT NULL,
        creation_date datetime NOT NULL,
        post_id INTEGER NOT NULL,
        post_type VARCHAR(20),
        user_id INTEGER NOT NULL,
        user_display_name VARCHAR(255),
        score INTEGER NOT NULL default 0
      )
    COMMENT

    badges =<<~BADGE
    CREATE TABLE if not exists stackoverflow.badges (
      id INTEGER NOT NULL PRIMARY KEY,
      name VARCHAR(32) NOT NULL,
      date datetime NOT NULL,
      user_id INTEGER NOT NULL,
      class INTEGER NOT NULL,
      tag_based BOOLEAN NOT NULL
    )
    BADGE

    execute(questions)
    execute(users)
    execute(votes)
    execute(answers)
    execute(tags)
    execute(comments)
    execute(badges)
  end
end