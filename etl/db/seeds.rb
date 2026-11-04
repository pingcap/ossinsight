
return if Collection.count > 0

require_relative '../lib/sample_importer'

# Pin the reviewed, repository-owned seed. Update this digest when reviewing a
# change to db/seed.sql; do not calculate it from the input at import time.
SampleImporter.run(
  sql_path: Rails.root.join('db', 'seed.sql').to_s,
  sha256: 'a23f2caf85090d486fcb83070883b2a729e5da2c24432a0b52ce025aff770d33',
  database_url: ENV.fetch('DATABASE_URL'),
  ssl_ca: ENV.fetch('DB_SSL_CA', '/etc/ssl/cert.pem')
)
