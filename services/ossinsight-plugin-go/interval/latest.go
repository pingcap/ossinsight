package interval

import (
	"fmt"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"github.com/pingcap-inc/ossinsight-plugin/risingwave"
	"go.uber.org/zap"
)

// latestLanguageMapListenerList listeners for latestLanguageMap
var latestLanguageMapListenerList = make(map[string]chan map[string]int)
var cacheLatestLanguageMap = make(map[string]int)

func latestLanguageLoad() error {
	languageMap, err := risingwave.GetLatestHourLanguageMap()
	if err != nil {
		logger.Error("load language map error", zap.Error(err))
		return err
	}
	languageMapDispatch(languageMap)

	return nil
}

func LanguageMapListenerRegister(key string, listener chan map[string]int) error {
	logger.Debug("latestLanguageMap register listener", zap.String("key", key))
	if listener == nil {
		return fmt.Errorf("listener is nil, please ckeck it")
	}

	latestLanguageMapListenerList[key] = listener

	return nil
}

func LanguageMapListenerDelete(key string) {
	logger.Debug("latestLanguageMap delete listener", zap.String("key", key))
	delete(latestLanguageMapListenerList, key)
}

func languageMapDispatch(latestLanguageMap map[string]int) {
	cacheLatestLanguageMap = latestLanguageMap
	// use another goroutine to prevent block listener has blocked channel
	go func() {
		for key := range latestLanguageMapListenerList {
			latestLanguageMapListenerList[key] <- latestLanguageMap
		}
	}()
}

func GetCachedLatestLanguageMap() map[string]int {
	return cacheLatestLanguageMap
}
