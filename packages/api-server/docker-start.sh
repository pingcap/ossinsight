#!/bin/sh
set -eu
exec node node_modules/fastify-cli/cli.js start --options -a 0.0.0.0 -p "${API_SERVER_PORT:-3450}" -L dist/logger.js -l info dist/app.js
