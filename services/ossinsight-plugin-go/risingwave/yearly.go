package risingwave

import (
	"context"
	"github.com/jackc/pgx/v5"
	"github.com/pingcap-inc/ossinsight-plugin/tidb"
	"strconv"
	"time"
)

func SetYearlyContent(content tidb.YearlyContent) error {
	initRisingWave()

	_, err := risingWave.Exec(context.Background(), `
		INSERT INTO t_year_sum 
		VALUES (@year, @developers, @repositories, @additions, @deletions)
	`, pgx.NamedArgs{
		"year":         time.Now().Year(),
		"developers":   content.Developers,
		"repositories": content.Repos,
		"additions":    content.Additions,
		"deletions":    content.Deletions,
	})

	return err
}

func IncreaseYearlySum(developers, repositories, additions, deletions int) error {
	initRisingWave()

	_, err := risingWave.Exec(context.Background(), `
		UPDATE t_year_sum 
		SET developers = developers + @developers,
            repositories = repositories + @repositories,
            additions = additions + @additions,
            deletions = deletions + @deletions
		WHERE year = @year
	`, pgx.NamedArgs{
		"year":         time.Now().Year(),
		"developers":   developers,
		"repositories": repositories,
		"additions":    additions,
		"deletions":    deletions,
	})

	return err
}

func GetThisYearlySumMap() (map[string]string, error) {
	initRisingWave()

	developers, repositories, additions, deletions := int64(0), int64(0), int64(0), int64(0)
	err := risingWave.QueryRow(context.Background(), `
		SELECT developers, repositories, additions, deletions
		FROM t_year_sum
		WHERE year = @year
	`, pgx.NamedArgs{
		"year": time.Now().Year(),
	}).Scan(&developers, &repositories, &additions, &deletions)

	if err != nil {
		return nil, err
	}

	return map[string]string{
		"dev":       strconv.FormatInt(developers, 10),
		"repo":      strconv.FormatInt(repositories, 10),
		"additions": strconv.FormatInt(additions, 10),
		"deletions": strconv.FormatInt(deletions, 10),
	}, nil
}
