package tidb

import (
	"fmt"
	"github.com/pingcap-inc/ossinsight-plugin/config"
)

type YearlyContent struct {
	Developers int
	Repos      int
	Additions  int
	Deletions  int
}

func QueryThisYearSumCount() (YearlyContent, error) {
	tidbConfig := config.GetReadonlyConfig().Tidb
	return QueryYearlyCount(tidbConfig.Sql.Yearly)
}

func QueryYearlyCount(sql string) (YearlyContent, error) {
	initDBOnce.Do(createDB)

	number := YearlyContent{}

	rows, err := tidb.Query(sql)
	if err != nil {
		return number, err
	}
	defer rows.Close()

	for rows.Next() {
		err = rows.Scan(&number.Developers, &number.Repos, &number.Additions, &number.Deletions)
		if err == nil {
			return number, nil
		} else {
			return number, err
		}
	}

	return number, fmt.Errorf("empty result")
}
