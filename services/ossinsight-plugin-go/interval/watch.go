package interval

import (
	"fmt"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"github.com/pingcap-inc/ossinsight-plugin/risingwave"
	"go.uber.org/zap"
)

type WatchChanged struct {
	Deletions map[string]string `json:"deletions"`
	Additions map[string]string `json:"additions"`
}

func (wc WatchChanged) IsEmpty() bool {
	return len(wc.Deletions) == 0 && len(wc.Additions) == 0
}

// watchLanguageMapListenerList listeners for latestLanguageMap
var watchLanguageMapListenerList = make(map[string]chan WatchChanged)

func watchLanguageLoad() error {
	deletionsMap, additionsMap, err := risingwave.GetAddAndDelLanguageMap()
	if err != nil {
		logger.Error("get watch changed error", zap.Error(err))
		return err
	}

	watched := WatchChanged{
		Deletions: deletionsMap,
		Additions: additionsMap,
	}

	if !watched.IsEmpty() {
		watchChangedDispatch(watched)
	}

	return nil
}

func WatchChangedListenerRegister(key string, listener chan WatchChanged) error {
	logger.Debug("watchLanguageMap register listener", zap.String("key", key))
	if listener == nil {
		return fmt.Errorf("listener is nil, please ckeck it")
	}

	watchLanguageMapListenerList[key] = listener

	return nil
}

func WatchChangedListenerDelete(key string) {
	logger.Debug("watchLanguageMap delete listener", zap.String("key", key))
	delete(watchLanguageMapListenerList, key)
}

func watchChangedDispatch(watchChanged WatchChanged) {
	// use another goroutine to prevent block listener has blocked channel
	go func() {
		for key := range watchLanguageMapListenerList {
			watchLanguageMapListenerList[key] <- watchChanged
		}
	}()
}
