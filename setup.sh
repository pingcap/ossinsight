#!/usr/bin/env bash

if [ -f .env ]; then
    read -rp ".env already exists, do you want to delete .env and recreate it? [y/n] " DELETE
    if [[ ${DELETE:-y} =~ ^[Yy]$ ]]
    then
      echo "Deleting .env"
      rm .env
    else
      echo "Exiting"
      exit 0
    fi;
fi

function check_dep(){
    echo "Checking for $1 ..."
    which "$1" 2>/dev/null || {
        echo "Please install $1."
        exit 1
    }
}
check_dep node
check_dep pnpm
check_dep npm

############### Common configuration ###############

# Config database connection.
read -rp "Enter the endpoint of TiDB cluster: " DB_ENDPOINT
DB_ENDPOINT=${DB_ENDPOINT:?err}

read -rp "The port of TiDB cluster [4000]: " DB_PORT
export DB_PORT=${DB_PORT:-4000}

read -rp "The username to connect the TiDB cluster: " DB_USERNAME
export DB_USERNAME=${DB_USERNAME:?err}

read -rps "The password to connect the TiDB cluster: " DB_PASSWORD
export DB_PASSWORD=${DB_PASSWORD:?err}

export DATABASE_URL=mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:${DB_PORT}/ossinsight

# Config GitHub Token.
if [ -z $GITHUB_TOKEN ]; then {
    read -rps "The personal access token of your GitHub account: " GITHUB_TOKEN
    export GITHUB_TOKEN=${GITHUB_TOKEN:?err}
}

# Config the domain of the frount end and API server.
export APP_HOST=http://localhost:3000
export APP_API_BASE=http://localhost:3450

# Write API server .env
API_SERVER_DOT_ENV=./packages/api-server/.env
echo "DATABASE_URL=mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_ENDPOINT}:${DB_PORT}/ossinsight?connectionLimit=100&queueLimit=10000" >> $API_SERVER_DOT_ENV
echo "ENABLE_CACHE=false" >> $API_SERVER_DOT_ENV
echo "GITHUB_ACCESS_TOKENS=${GITHUB_TOKEN}" >> $API_SERVER_DOT_ENV
