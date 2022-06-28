#!/bin/sh

set -x

bundle install
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rake  db:seed
bundle exec rake gh:set_tiflash_replica
bundle exec rails runner 'Realtime.new(ENV["GITHUB_TOKEN"].to_s.split(","), 100).run'