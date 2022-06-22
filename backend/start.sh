#!/bin/sh

set -x

bundle install
sleep 20
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rake gh:load_collection
bundle exec rails runner 'Realtime.new(ENV["GITHUB_TOKEN"].to_s.split(","), 100).run'