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
	"github.com/gorilla/websocket"
	"github.com/pingcap-inc/ossinsight-plugin/fetcher"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"go.uber.org/zap"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

type SamplingConfig struct {
	SamplingRate int      `json:"samplingRate"`
	EventType    string   `json:"eventType"`
	RepoName     string   `json:"repoName"`
	UserName     string   `json:"userName"`
	Filter       []string `json:"filter"`
	ReturnType   string   `json:"returnType"`
}

func samplingHandler(w http.ResponseWriter, r *http.Request, upgrader *websocket.Upgrader) {
	connection, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error("upgrade websocket error", zap.Error(err))
		return
	}

	name := strconv.FormatInt(time.Now().UnixNano(), 10) +
		strconv.FormatInt(rand.Int63(), 10)

	configChan := make(chan SamplingConfig)
	go readSamplingHandler(name, connection, configChan)
	go writeSamplingHandler(name, connection, configChan)
}

func writeSamplingHandler(name string, connection *websocket.Conn, configChan chan SamplingConfig) {
	samplingConfig := <-configChan

	listener := make(chan fetcher.Msg)
	err := ListenerRegister(name, listener)
	if err != nil {
		logger.Error("listener register error", zap.Error(err))
		return
	}

	currentCount := 0
	go func() {
		for {
			msg := <-listener
			if !remain(msg, samplingConfig.EventType, samplingConfig.RepoName, samplingConfig.UserName) {
				continue
			}

			currentCount++
			if currentCount%samplingConfig.SamplingRate == 0 {
				data, err := json.Marshal(msg)
				if err != nil {
					logger.Error("marshal error", zap.Error(err))
					return
				}

				if samplingConfig.Filter != nil && len(samplingConfig.Filter) != 0 {
					// exist filter
					data, err = FilterMessageToByteArray(data, samplingConfig.Filter, samplingConfig.ReturnType)
					if err != nil {
						logger.Error("filter error", zap.Error(err))
						return
					}
				}

				err = connection.WriteMessage(websocket.TextMessage, data)
				if err != nil {
					logger.Error("write error", zap.Error(err))
					return
				}
			}
		}
	}()
}

func readSamplingHandler(name string, connection *websocket.Conn, configChan chan SamplingConfig) {
	defer func() {
		ListenerDelete(name)
		connection.Close()
	}()

	err := writeSamplingFirstResponse(connection)
	if err != nil {
		logger.Error("write first response error", zap.Error(err))
		return
	}

	configSet := false
	for {
		msgType, msg, err := connection.ReadMessage()
		if err != nil {
			logger.Error("read message error", zap.Error(err))
			return
		}

		if msgType == websocket.TextMessage {
			if configSet {
				logger.Error("config already set")
				continue
			}

			samplingConfig := new(SamplingConfig)
			err = json.Unmarshal(msg, samplingConfig)
			if err != nil {
				log.Println("config parse error:", err)
				return
			}

			configSet = true
			configChan <- *samplingConfig
		}
	}
}
