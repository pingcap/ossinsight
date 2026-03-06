package main

import (
	"container/heap"
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

type (
	LatestConfig struct {
		Top      int      `json:"top"`
		Language []string `json:"language"`
	}

	HeapNode struct {
		LanguageName string
		Num          int
	}

	TopNHeap []HeapNode
)

func (h TopNHeap) Len() int           { return len(h) }
func (h TopNHeap) Less(i, j int) bool { return h[i].Num > h[j].Num }
func (h TopNHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *TopNHeap) Push(x any)        { *h = append(*h, x.(HeapNode)) }
func (h *TopNHeap) Pop() any {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}

func latestHandler(w http.ResponseWriter, r *http.Request, upgrader *websocket.Upgrader) {
	connection, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error("upgrade websocket error", zap.Error(err))
		return
	}

	name := strconv.FormatInt(time.Now().UnixNano(), 10) +
		strconv.FormatInt(rand.Int63(), 10)

	configChan := make(chan LatestConfig)
	go readLatestHandler(name, connection, configChan)
	go writeLatestHandler(name, connection, configChan)
}

func writeLatestHandler(name string, connection *websocket.Conn, configChan chan LatestConfig) {
	latestConfig := <-configChan

	listener := make(chan map[string]int)
	err := interval.LanguageMapListenerRegister(name, listener)
	if err != nil {
		logger.Error("listener register error", zap.Error(err))
		return
	}

	go func() {
		for {
			languageMap := <-listener

			// languages filter
			if latestConfig.Language != nil && len(latestConfig.Language) != 0 {
				tempLanguageMap := make(map[string]int)
				for _, language := range latestConfig.Language {
					if num, exist := languageMap[language]; exist {
						tempLanguageMap[language] = num
					}
				}

				languageMap = tempLanguageMap
			}

			// topN filter
			if latestConfig.Top != 0 {
				languageMap = selectTopN(languageMap, latestConfig.Top)
			}

			result, err := json.Marshal(languageMap)
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

func readLatestHandler(name string, connection *websocket.Conn, configChan chan LatestConfig) {
	defer func() {
		interval.LanguageMapListenerDelete(name)
		connection.Close()
	}()

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

			latestConfig := new(LatestConfig)
			err = json.Unmarshal(msg, latestConfig)
			if err != nil {
				log.Println("config parse error:", err)
				return
			}

			configSet = true
			configChan <- *latestConfig
		}
	}
}

func selectTopN(latestMap map[string]int, top int) map[string]int {
	if len(latestMap) <= top {
		return latestMap
	}

	topNHeap := make(TopNHeap, 0)
	heap.Init(&topNHeap)
	for language, num := range latestMap {
		heap.Push(&topNHeap, HeapNode{
			LanguageName: language,
			Num:          num,
		})
	}

	resultMap := make(map[string]int)
	for i := 0; i < top; i++ {
		currentMax := heap.Pop(&topNHeap).(HeapNode)
		resultMap[currentMax.LanguageName] = currentMax.Num
	}

	return resultMap
}
