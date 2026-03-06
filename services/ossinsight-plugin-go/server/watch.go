package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"github.com/pingcap-inc/ossinsight-plugin/interval"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"go.uber.org/zap"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

type WatchConfig struct {
	Language []string `json:"language"`
}

func watchHandler(w http.ResponseWriter, r *http.Request, upgrader *websocket.Upgrader) {
	connection, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error("upgrade websocket error", zap.Error(err))
		return
	}

	name := strconv.FormatInt(time.Now().UnixNano(), 10) +
		strconv.FormatInt(rand.Int63(), 10)

	configChan := make(chan WatchConfig)
	go readWatchHandler(name, connection, configChan)
	go writeWatchHandler(name, connection, configChan)
}

func writeWatchHandler(name string, connection *websocket.Conn, configChan chan WatchConfig) {
	latestConfig := <-configChan

	listener := make(chan interval.WatchChanged)
	err := interval.WatchChangedListenerRegister(name, listener)
	if err != nil {
		logger.Error("listener register error", zap.Error(err))
		return
	}

	go func() {
		for {
			changedMap := <-listener

			// languages filter
			if latestConfig.Language != nil && len(latestConfig.Language) != 0 {
				tempLanguageMap := make(map[string]string)
				for _, language := range latestConfig.Language {
					if num, exist := changedMap.Additions[language]; exist {
						tempLanguageMap[language] = num
					}
				}
				changedMap.Additions = tempLanguageMap

				tempLanguageMap = make(map[string]string)
				for _, language := range latestConfig.Language {
					if num, exist := changedMap.Deletions[language]; exist {
						tempLanguageMap[language] = num
					}
				}
				changedMap.Deletions = tempLanguageMap
			}

			if changedMap.IsEmpty() {
				continue
			}

			result, err := json.Marshal(changedMap)
			if err != nil {
				logger.Error("filtered message marshal error", zap.Error(err))
				continue
			}

			err = connection.WriteMessage(websocket.TextMessage, result)
			if err != nil {
				logger.Error("write error", zap.Error(err))
				return
			}
		}
	}()
}

func readWatchHandler(name string, connection *websocket.Conn, configChan chan WatchConfig) {
	defer func() {
		interval.WatchChangedListenerDelete(name)
		connection.Close()
	}()

	err := writeWatchFirstResponse(connection)
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

			watchConfig := new(WatchConfig)
			err = json.Unmarshal(msg, watchConfig)
			if err != nil {
				log.Println("config parse error:", err)
				return
			}

			configSet = true
			configChan <- *watchConfig
		}
	}
}
