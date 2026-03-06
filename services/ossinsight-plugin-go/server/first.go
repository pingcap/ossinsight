package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"github.com/pingcap-inc/ossinsight-plugin/interval"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"github.com/pingcap-inc/ossinsight-plugin/risingwave"
	"go.uber.org/zap"
)

type (
	SamplingFirstResponse struct {
		FirstMessageTag bool              `json:"firstMessageTag"`
		APIVersion      int               `json:"apiVersion"`
		EventMap        map[string]string `json:"eventMap"`
		OpenMap         map[string]string `json:"openMap"`
		MergeMap        map[string]string `json:"mergeMap"`
		CloseMap        map[string]string `json:"closeMap"`
		DevMap          map[string]string `json:"devMap"`
		SumMap          map[string]string `json:"sumMap"`
	}

	WatchFirstResponse struct {
		FirstMessageTag bool           `json:"firstMessageTag"`
		APIVersion      int            `json:"apiVersion"`
		LanguageMap     map[string]int `json:"languageMap"`
	}
)

func writeSamplingFirstResponse(connection *websocket.Conn) error {
	version := config.GetReadonlyConfig().Api.Version

	eventMap, openMap, mergeMap, closeMap, devMap, err := risingwave.GetDailyMapsForThisYear()
	if err != nil {
		logger.Error("risingwave get this year event number error", zap.Error(err))
		return err
	}

	sumMap, err := risingwave.GetThisYearlySumMap()
	if err != nil {
		logger.Error("risingwave get this year sum map error", zap.Error(err))
		return err
	}

	response := SamplingFirstResponse{
		FirstMessageTag: true,
		APIVersion:      version,
		EventMap:        eventMap,
		OpenMap:         openMap,
		MergeMap:        mergeMap,
		CloseMap:        closeMap,
		DevMap:          devMap,
		SumMap:          sumMap,
	}

	payload, _ := json.Marshal(response)

	err = connection.WriteMessage(websocket.TextMessage, payload)
	if err != nil {
		logger.Error("write first response", zap.Error(err))
		return err
	}

	return nil
}

func writeWatchFirstResponse(connection *websocket.Conn) error {
	version := config.GetReadonlyConfig().Api.Version

	cachedLanguageMap := interval.GetCachedLatestLanguageMap()

	response := WatchFirstResponse{
		FirstMessageTag: true,
		APIVersion:      version,
		LanguageMap:     cachedLanguageMap,
	}

	payload, _ := json.Marshal(response)

	err := connection.WriteMessage(websocket.TextMessage, payload)
	if err != nil {
		logger.Error("write first response", zap.Error(err))
		return err
	}

	return nil
}
