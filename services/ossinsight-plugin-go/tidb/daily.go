package tidb

import (
	"github.com/pingcap-inc/ossinsight-plugin/config"

	_ "github.com/go-sql-driver/mysql"
)

type DailyEvent struct {
	EventDay   string `json:"event_day"`
	Developers int64  `json:"developers"`
	OpenedPRs  int64  `json:"opened_prs"`
	ClosedPRs  int64  `json:"closed_prs"`
	MergedPRs  int64  `json:"merged_prs"`
}

func QueryThisYearDailyEvent() ([]DailyEvent, error) {
	initDBOnce.Do(createDB)

	tidbConfig := config.GetReadonlyConfig().Tidb
	rows, err := tidb.Query(tidbConfig.Sql.EventsDaily)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []DailyEvent
	for rows.Next() {
		event := DailyEvent{}
		err = rows.Scan(&event.EventDay, &event.Developers,
			&event.OpenedPRs, &event.ClosedPRs, &event.MergedPRs)
		if err == nil {
			result = append(result, event)
		} else {
			return result, err
		}
	}

	return result, nil
}
