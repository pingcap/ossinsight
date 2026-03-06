package risingwave

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5"
	"time"
)

func EventIDExists(id string) (bool, error) {
	initRisingWave()

	ctx := context.Background()

	existCount := 0
	err := risingWave.QueryRow(ctx, `
		SELECT COUNT(*) FROM t_github_prs
		WHERE id = @id
	`, pgx.NamedArgs{"id": id}).Scan(&existCount)

	if err != nil {
		return false, err
	}

	return existCount != 0, nil
}

func DevIDTestExistsForThisYear(developer int64) (bool, error) {
	timeLayout := "2006-01-02 15:04:05"
	thisYearStart, err := time.Parse(timeLayout, fmt.Sprintf("%d-01-01 00:00:00", time.Now().Year()))
	if err != nil {
		return false, err
	}
	return devIDTestExistsAndInsert(developer, thisYearStart)
}

func DevIDTestExistsForToday(developer int64) (bool, error) {
	timeLayout := "2006-01-02 15:04:05"
	todayStart, err := time.Parse(timeLayout, time.Now().Format("2006-01-02")+" 00:00:00")
	if err != nil {
		return false, err
	}
	return devIDTestExistsAndInsert(developer, todayStart)
}

func devIDTestExistsAndInsert(developer int64, startTime time.Time) (bool, error) {
	initRisingWave()

	ctx := context.Background()

	existCount := 0
	err := risingWave.QueryRow(ctx, `
		SELECT COUNT(*) FROM t_developer_id
		WHERE developer = @developer
		AND create_time >= @start_time
	`, pgx.NamedArgs{"developer": developer, "start_time": startTime}).Scan(&existCount)

	if err != nil {
		return false, err
	}

	createTime := time.Unix(time.Now().Unix(), 0)
	_, err = risingWave.Exec(ctx, `
		INSERT INTO t_developer_id 
		VALUES (@developer, @create_time)
	`, pgx.NamedArgs{
		"developer":   developer,
		"create_time": createTime,
	})

	if err != nil {
		return false, err
	}

	risingWave.Exec(ctx, "FLUSH")

	return existCount != 0, nil
}

func RepoIDTestExistsForThisYear(repository int64) (bool, error) {
	initRisingWave()

	ctx := context.Background()

	existCount := 0
	err := risingWave.QueryRow(ctx, `
		SELECT COUNT(*) FROM t_repository_id
		WHERE repository = @repository
		AND create_time >= date_trunc('year', CURRENT_TIMESTAMP)
	`, pgx.NamedArgs{"repository": repository}).Scan(&existCount)

	if err != nil {
		return false, err
	}

	createTime := time.Unix(time.Now().Unix(), 0)
	_, err = risingWave.Exec(ctx, `
		INSERT INTO t_repository_id 
		VALUES (@repository, @create_time)
	`, pgx.NamedArgs{
		"repository":  repository,
		"create_time": createTime,
	})

	if err != nil {
		return false, err
	}

	risingWave.Exec(ctx, "FLUSH")

	return existCount != 0, nil
}
