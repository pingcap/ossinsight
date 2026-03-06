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
	"fmt"
	"github.com/pingcap-inc/ossinsight-plugin/fetcher"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"go.uber.org/zap"
)

var listenerMap = make(map[string]chan fetcher.Msg)

func ListenerRegister(key string, listener chan fetcher.Msg) error {
	logger.Debug("register listener", zap.String("key", key))
	if listener == nil {
		return fmt.Errorf("listener is nil, please ckeck it")
	}

	listenerMap[key] = listener

	return nil
}

func ListenerDelete(key string) {
	logger.Debug("delete listener", zap.String("key", key))
	delete(listenerMap, key)
}

func DispatchEvent(event fetcher.Msg) {
	// use another goroutine to prevent block listener has blocked channel
	go func() {
		for key := range listenerMap {
			listenerMap[key] <- event
		}
	}()
}
