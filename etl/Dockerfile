ARG RUBY_IMAGE=ruby:3.4.12-slim-bookworm@sha256:a0636a941ef86063f17b343f6c96f271f8eeedd76febf035bb6d57bc5024682b
FROM ${RUBY_IMAGE} AS builder
RUN apt-get update && apt-get install -y --no-install-recommends build-essential default-libmysqlclient-dev pkg-config git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN gem install bundler -v 4.0.23 --no-document
ENV BUNDLE_DEPLOYMENT=1 BUNDLE_FROZEN=1 BUNDLE_PATH=/bundle BUNDLE_WITHOUT=development:test
WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN bundle _4.0.23_ install --jobs 2 --retry 3 && rm -rf /bundle/ruby/*/cache

FROM ${RUBY_IMAGE} AS runtime
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends libmariadb3 mariadb-client ca-certificates tzdata && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 10001 etl && useradd --uid 10001 --gid etl --no-create-home --shell /usr/sbin/nologin etl
RUN gem install bundler -v 4.0.23 --no-document
ENV RAILS_ENV=production RAILS_LOG_TO_STDOUT=1 BUNDLE_DEPLOYMENT=1 BUNDLE_FROZEN=1 BUNDLE_PATH=/bundle BUNDLE_WITHOUT=development:test \
    BOOTSNAP_CACHE_DIR=/tmp/bootsnap CACHE_DIR=/tmp/gharchives DUMP_DIR=/tmp/ossinsight-dumps \
    DB_SSL_CA=/etc/ssl/certs/ca-certificates.crt SAMPLE_MYSQL_CLIENT_FLAVOR=mariadb ETL_HEARTBEAT_PATH=/tmp/ossinsight-etl.heartbeat
WORKDIR /app
COPY --from=builder /bundle /bundle
COPY . ./
RUN chmod -R a+rX,go-w /app /bundle && chmod 0555 start.sh
USER 10001:10001
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 CMD ["ruby", "bin/healthcheck"]
CMD ["./start.sh"]
