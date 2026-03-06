package interval

import (
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"github.com/pingcap-inc/ossinsight-plugin/risingwave"
	"go.uber.org/zap"
	"time"
)

func InitInterval() {
	intervalConfig := config.GetReadonlyConfig().Interval

	dailyInterval, err := time.ParseDuration(intervalConfig.Daily)
	if err != nil {
		logger.Error("daily interval parse error, use default", zap.Error(err))
		dailyInterval = time.Hour
	}

	go func() {
		for range time.Tick(dailyInterval) {
			retry(dailySync)
		}
	}()

	go func() {
		for range time.Tick(24 * time.Hour) {
			risingwave.DataClean()
		}
	}()

	latestLanguageInterval, err := time.ParseDuration(intervalConfig.Latest)
	if err != nil {
		logger.Error("latest language interval parse error, use default", zap.Error(err))
		latestLanguageInterval = time.Second
	}

	go func() {
		for range time.Tick(latestLanguageInterval) {
			retry(latestLanguageLoad)
		}
	}()

	go func() {
		for range time.Tick(latestLanguageInterval) {
			retry(watchLanguageLoad)
		}
	}()
}

func retry(handler func() error) {
	intervalConfig := config.GetReadonlyConfig().Interval
	for i := 0; i < intervalConfig.Retry; i++ {
		if err := handler(); err != nil {
			logger.Error("sync error", zap.Int("round", i), zap.Error(err))
			time.Sleep(time.Duration(intervalConfig.RetryWait) * time.Millisecond)
		} else {
			// success
			break
		}
	}
}
