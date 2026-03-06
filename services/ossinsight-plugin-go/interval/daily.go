package interval

import (
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"github.com/pingcap-inc/ossinsight-plugin/risingwave"
	"github.com/pingcap-inc/ossinsight-plugin/tidb"
	"go.uber.org/zap"
)

func dailySync() error {
	events, err := tidb.QueryThisYearDailyEvent()
	if err != nil {
		logger.Error("error occurred when querying tidb the events of this year", zap.Error(err))
		return err
	}

	yearSum, err := tidb.QueryThisYearSumCount()
	if err != nil {
		logger.Error("error occurred when querying tidb the developer amount of this year", zap.Error(err))
		return err
	}

	err = risingwave.UpsertEventDaily(events)
	if err != nil {
		logger.Error("error occurred when setting the events of this year in risingwave", zap.Error(err))
		return err
	}

	err = risingwave.SetYearlyContent(yearSum)
	if err != nil {
		logger.Error("error occurred when setting the sum of this year in risingwave", zap.Error(err))
		return err
	}
	return nil
}
