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
	"github.com/gorilla/websocket"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"github.com/pingcap-inc/ossinsight-plugin/fetcher"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"go.uber.org/zap"
	"io"
	"net/http"
	"strconv"
)

func createWebsocket() {
	readonlyConfig := config.GetReadonlyConfig()

	upgrader := &websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	http.HandleFunc("/sampling", func(w http.ResponseWriter, r *http.Request) {
		samplingHandler(w, r, upgrader)
	})

	http.HandleFunc("/language/latest", func(w http.ResponseWriter, r *http.Request) {
		latestHandler(w, r, upgrader)
	})

	http.HandleFunc("/language/watch", func(w http.ResponseWriter, r *http.Request) {
		watchHandler(w, r, upgrader)
	})

	http.HandleFunc(readonlyConfig.Server.Health, func(w http.ResponseWriter, r *http.Request) {
		io.WriteString(w, "OK")
	})

	port := readonlyConfig.Server.Port
	err := http.ListenAndServe(":"+strconv.Itoa(port), nil)
	if err != nil {
		logger.Fatal("websocket server start error", zap.Error(err))
	}
	logger.Info("websocket start", zap.Int("port", port))
}

func remain(msg fetcher.Msg, eventType, repoName, userName string) bool {
	if len(eventType) > 0 && msg.Event.Type != nil && *msg.Event.Type != eventType {
		return false
	}

	if len(repoName) > 0 && msg.Event.Repo != nil && msg.Event.Repo.Name != nil && *msg.Event.Repo.Name != repoName {
		return false
	}

	if len(userName) > 0 && msg.Event.Actor.Login != nil && *msg.Event.Actor.Login != userName {
		return false
	}

	return true
}
