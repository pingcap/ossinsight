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
	"context"
	"github.com/apache/pulsar-client-go/pulsar"
	"github.com/pingcap-inc/ossinsight-plugin/lark"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"go.uber.org/zap"
	"sync"
)

var (
	producer         pulsar.Producer
	producerInitOnce sync.Once
)

// initProducer Initial producer instance. Use producerInitOnce to ensure initial only once.
func initProducer() {
	initClient()

	producerInitOnce.Do(func() {
		var err error
		producer, err = client.CreateProducer(pulsar.ProducerOptions{
			Topic: readonlyConfig.Pulsar.Producer.Topic,
		})

		if err != nil {
			logger.Panic("init pulsar producer error", zap.Error(err))
		}
	})
}

// Send message send function
func Send(payload []byte, key string) error {
	initProducer()

	var lastErr error
	for retry := 0; retry < readonlyConfig.Pulsar.Producer.Retry; retry++ {
		if lastErr = sendOnce(payload, key); lastErr != nil {
			logger.Error("send message error", zap.Error(lastErr), zap.Int("retry times", retry))
			lark.SendWithToleranceAndFrequencyControl("send pulsar message error, PTAL!")
		} else {
			break
		}
	}
	return lastErr
}

func sendOnce(payload []byte, key string) error {
	_, err := producer.Send(context.Background(), &pulsar.ProducerMessage{
		Payload: payload,
		Key:     key,
	})

	if err != nil {
		logger.Error("send message error", zap.Error(err))
		return err
	}

	return nil
}
