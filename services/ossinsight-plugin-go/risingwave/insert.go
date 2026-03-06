package risingwave

import (
	"context"
	"github.com/jackc/pgx/v5"
	"time"
)

func InsertMessage(id string, devID, repoID int64,
	createTime time.Time, programLanguage string) error {
	initRisingWave()

	ctx := context.Background()

	// cut the time into seconds
	createTime = time.Unix(createTime.Unix(), 0)
	_, err := risingWave.Exec(ctx, `
		INSERT INTO t_github_prs 
		VALUES (@id, @dev_id, @repo_id, @create_time, @program_language)
	`, pgx.NamedArgs{
		"id":               id,
		"dev_id":           devID,
		"repo_id":          repoID,
		"create_time":      createTime,
		"program_language": programLanguage,
	})

	return err
}
