FROM ruby:2.7.2-alpine

ENV BUNDLER_VERSION=2.2.3

RUN apk update && apk upgrade && apk add python3

RUN apk add --update --no-cache \
      binutils-gold \
      build-base \
      curl \
      file \
      g++ \
      gcc \
      git \
      less \
      libstdc++ \
      libffi-dev \
      libc-dev \ 
      linux-headers \
      libxml2-dev \
      libxslt-dev \
      libgcrypt-dev \
      make \
      netcat-openbsd \
      nodejs \
      openssl \
      pkgconfig \
      tzdata \
      mysql-client \
      mysql-dev  \
      yarn \
      && rm -rf /var/cache/apk/*

RUN gem install bundler -v 2.2.3

WORKDIR /app

COPY Gemfile Gemfile.lock ./
COPY start.sh ./

RUN bundle config build.nokogiri --use-system-libraries

RUN bundle check || bundle install --no-cache && rm -rf /usr/local/bundle/cache

COPY . ./ 
