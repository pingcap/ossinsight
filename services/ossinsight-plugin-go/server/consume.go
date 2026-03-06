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

package main

import (
	"encoding/json"
	"github.com/apache/pulsar-client-go/pulsar"
	"github.com/pingcap-inc/ossinsight-plugin/fetcher"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"github.com/pingcap-inc/ossinsight-plugin/mq"
	"go.uber.org/zap"
)

func startConsumeMessage() {
	mq.StartConsume(func(message pulsar.Message) error {
		payload := message.Payload()

		var msg fetcher.Msg
		err := json.Unmarshal(payload, &msg)
		if err != nil {
			logger.Error("event unmarshal error", zap.Error(err))
			// drop this message, or it will block whole topic
			return nil
		}

		// dispatch event to all listeners
		DispatchEvent(msg)
		return nil
	})
}
