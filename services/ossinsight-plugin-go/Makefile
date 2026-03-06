# Copyright 2022 PingCAP, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

.PHONY: redis pulsar config build start restart stop

redis:
	docker run -itd --name redis-test -p 6379:6379 redis

pulsar:
	docker run -itd -p 6650:6650 -p 8080:8080 apachepulsar/pulsar:3.1.2 bin/pulsar standalone

config:
	go install github.com/Icemap/yaml2go-cli@latest
	yaml2go-cli -p config -s Config -i config/config.yaml -o config/config_struct.go

build:
	go build -o bin/ossinsight-plugin github.com/pingcap-inc/ossinsight-plugin/server

build-server:
	brew install FiloSottile/musl-cross/musl-cross
	CGO_ENABLED=1 GOOS=linux GOARCH=amd64 CC=x86_64-linux-musl-gcc CGO_LDFLAGS="-static" go build -o bin/ossinsight-plugin github.com/pingcap-inc/ossinsight-plugin/server

start:
	pm2 start bin/ossinsight-plugin --name ossinsight-plugin --max-memory-restart 512M

restart:
	git pull origin main
	make build
	pm2 restart ossinsight-plugin

stop:
	pm2 stop ossinsight-plugin
	pm2 delete ossinsight-plugin

risingwave_recreate:
	psql -h 192.168.0.3 -p 4566 -d dev -U root -a -f ./risingwave/drop_objects.sql
	psql -h 192.168.0.3 -p 4566 -d dev -U root -a -f ./risingwave/create_objects.sql
