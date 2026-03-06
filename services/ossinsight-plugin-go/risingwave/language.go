package risingwave

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"os"
	"strconv"
	"time"
)

func GetAddAndDelLanguageMap() (map[string]string, map[string]string, error) {
	initRisingWave()

	additionsTime := time.Now()
	secondLength := config.GetReadonlyConfig().Interval.LatestDuring
	deletionsTime := additionsTime.Add(-time.Second * time.Duration(secondLength+1))

	additionsMap, deletionsMap := make(map[string]string), make(map[string]string)

	rows, err := risingWave.Query(
		context.Background(),
		`
		SELECT program_language, create_time, amount
		FROM mv_secondly_language_count
		WHERE create_time = @deletions_time
			OR create_time = @additions_time
		`,
		pgx.NamedArgs{
			"deletions_time": deletionsTime,
			"additions_time": additionsTime,
		})

	if err != nil {
		fmt.Fprintf(os.Stderr, "GetLanguageMapBySecond query failed: %v\n", err)
		return nil, nil, err
	}
	defer rows.Close()
	for rows.Next() {
		programLanguage, createTime, amount := "", time.Unix(0, 0), 0

		err = rows.Scan(&programLanguage, &createTime, &amount)
		if err != nil {
			return nil, nil, err
		}

		if createTime.Unix() == additionsTime.Unix() {
			additionsMap[programLanguage] = strconv.Itoa(amount)
		} else {
			deletionsMap[programLanguage] = strconv.Itoa(amount)
		}
	}

	return additionsMap, deletionsMap, nil
}

func GetLatestHourLanguageMap() (map[string]int, error) {
	initRisingWave()

	languageMap := make(map[string]int)

	rows, err := risingWave.Query(
		context.Background(),
		`SELECT program_language, amount FROM mv_latest_hour_language_count`)

	if err != nil {
		fmt.Fprintf(os.Stderr, "GetLatestHourLanguageMap query failed: %v\n", err)
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		programLanguage, amount := "", 0

		err = rows.Scan(&programLanguage, &amount)
		if err != nil {
			return nil, err
		}

		languageMap[programLanguage] = amount
	}

	return languageMap, nil
}
