#!/bin/sh

set -eu
umask 077

# Dependencies are installed at image build time. Schema/seed maintenance is
# explicit: starting an ingestion worker must never mutate database structure.
exec bundle exec rails runner 'Realtime.new(ENV.fetch("GITHUB_TOKEN").split(",").reject(&:empty?), 100).run'
