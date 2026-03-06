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
	"sync"

	"go.uber.org/zap"

	"github.com/apache/pulsar-client-go/pulsar"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
)

// ConsumeFunc Message deal function
type ConsumeFunc func(pulsar.Message) error

var consumerInitOnce sync.Once

// StartConsume start to consume message. Use consumerInitOnce to ensure initial only once.
// create consume number : readonlyConfig.Pulsar.Consumer.Concurrency
func StartConsume(consumeFunc ConsumeFunc) {
	initClient()

	consumerInitOnce.Do(func() {
		for i := 0; i < readonlyConfig.Pulsar.Consumer.Concurrency; i++ {
			go perConsumer(readonlyConfig, consumeFunc)
		}
	})
}

// perConsumer every consumer create function
func perConsumer(readonlyConfig config.Config, consumeFunc ConsumeFunc) {
	consumer, err := client.Subscribe(pulsar.ConsumerOptions{
		Topic:            readonlyConfig.Pulsar.Consumer.Topic,
		SubscriptionName: readonlyConfig.Pulsar.Consumer.Name,
		Type:             pulsar.Shared,
	})

	if err != nil {
		logger.Panic("init pulsar producer error", zap.Error(err))
	}

	for {
		msg, err := consumer.Receive(context.Background())
		if err != nil {
			logger.Error("receive message error", zap.Error(err))
		}

		if err := consumeFunc(msg); err != nil {
			logger.Error("consume function error", zap.Error(err))
			consumer.Nack(msg)
		} else {
			consumer.Ack(msg)
		}
	}
}
