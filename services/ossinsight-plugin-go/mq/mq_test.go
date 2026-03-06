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
	"fmt"
	"github.com/apache/pulsar-client-go/pulsar"
	"go.uber.org/atomic"
	"testing"
	"time"
)

func TestInitClient(t *testing.T) {
	initClient()
}

func TestMessage(t *testing.T) {
	messageNum := 10
	for i := 0; i < messageNum; i++ {
		go func() {
			err := Send([]byte("hello world"), "key")
			if err != nil {
				t.Error(err)
			}
		}()
	}

	receivedNum := atomic.NewInt64(0)
	StartConsume(func(message pulsar.Message) error {
		receivedNum.Add(1)
		fmt.Printf("received %d message\n", receivedNum.Load())
		if string(message.Payload()) != "hello world" || message.Key() != "key" {
			t.Errorf("received msg: %+v\n", message)
		}
		return nil
	})

	time.Sleep(5 * time.Second)
}
