package risingwave

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pingcap-inc/ossinsight-plugin/tidb"
	"os"
	"strconv"
	"time"
)

func UpsertEventDaily(events []tidb.DailyEvent) error {
	initRisingWave()

	batch := pgx.Batch{}
	for _, event := range events {
		batch.Queue(`
			INSERT INTO t_event_daily 
			    (day, pr, open, merge, close, dev) 
			VALUES (@day, @pr, @open, @merge, @close, @dev)`,
			pgx.NamedArgs{
				"day":   event.EventDay,
				"pr":    event.OpenedPRs + event.ClosedPRs + event.MergedPRs,
				"open":  event.OpenedPRs,
				"merge": event.MergedPRs,
				"close": event.ClosedPRs,
				"dev":   event.Developers,
			})
	}

	_, err := risingWave.SendBatch(context.Background(), &batch).Exec()
	return err
}

func IncreaseEventDaily(pr, open, merge, close, dev int) error {
	initRisingWave()

	_, err := risingWave.Exec(context.Background(), `
		UPDATE t_event_daily
		SET pr = pr + @pr_update, 
		    open = open + @open_update,
		    merge = merge + @merge_update, 
		    close = close + @close_update, 
		    dev = dev + @dev_update
		WHERE day = @day`,
		pgx.NamedArgs{
			"pr_update":    pr,
			"open_update":  open,
			"merge_update": merge,
			"close_update": close,
			"dev_update":   dev,
			"day":          pgtype.Date{Time: time.Now()},
		})

	return err
}

func GetDailyMapsForThisYear() (eventMap, openMap, mergeMap, closeMap, devMap map[string]string, err error) {
	initRisingWave()

	eventMap, openMap, mergeMap, closeMap, devMap =
		make(map[string]string), make(map[string]string),
		make(map[string]string), make(map[string]string),
		make(map[string]string)

	rows, err := risingWave.Query(
		context.Background(),
		`
			SELECT day, pr, open, merge, close, dev FROM t_event_daily
			WHERE day >= date_trunc('year', CURRENT_TIMESTAMP)
		`)

	if err != nil {
		fmt.Fprintf(os.Stderr, "GetLatestHourLanguageMap query failed: %v\n", err)
		return nil, nil, nil, nil, nil, err
	}

	defer rows.Close()
	for rows.Next() {
		day, prAmount, openAmount, mergeAmount, closeAmount, devAmount :=
			pgtype.Date{}, int64(0), int64(0), int64(0), int64(0), int64(0)

		err = rows.Scan(&day, &prAmount, &openAmount, &mergeAmount, &closeAmount, &devAmount)
		if err != nil {
			return nil, nil, nil, nil, nil, err
		}

		dayString := day.Time.Format("2006-01-02")
		eventMap[dayString] = strconv.FormatInt(prAmount, 10)
		openMap[dayString] = strconv.FormatInt(openAmount, 10)
		mergeMap[dayString] = strconv.FormatInt(mergeAmount, 10)
		closeMap[dayString] = strconv.FormatInt(closeAmount, 10)
		devMap[dayString] = strconv.FormatInt(devAmount, 10)
	}

	return eventMap, openMap, mergeMap, closeMap, devMap, nil
}
