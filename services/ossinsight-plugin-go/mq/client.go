// Copyright 2022 PingCAP, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package mq

import (
	"github.com/apache/pulsar-client-go/pulsar"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"go.uber.org/zap"
	"sync"
)

var (
	client         pulsar.Client
	clientInitOnce sync.Once
	readonlyConfig config.Config
)

// initClient Initial client instance. Use clientInitOnce to ensure initial only once.
func initClient() {
	clientInitOnce.Do(func() {
		readonlyConfig = config.GetReadonlyConfig()

		var err error
		if readonlyConfig.Pulsar.Env != "dev" {
			oauth := pulsar.NewAuthenticationOAuth2(map[string]string{
				"type":       "client_credentials",
				"audience":   readonlyConfig.Pulsar.Audience,
				"privateKey": "file://" + readonlyConfig.Pulsar.Keypath,
			})

			client, err = pulsar.NewClient(pulsar.ClientOptions{
				URL:            readonlyConfig.Pulsar.Host,
				Authentication: oauth,
			})
		} else {
			client, err = pulsar.NewClient(pulsar.ClientOptions{
				URL: readonlyConfig.Pulsar.DevHost,
			})
		}

		if err != nil {
			logger.Panic("init pulsar client error", zap.Error(err))
		}
	})
}
