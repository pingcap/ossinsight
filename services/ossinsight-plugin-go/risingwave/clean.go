package risingwave

import (
	"context"
	"github.com/jackc/pgx/v5"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"time"
)

func DataClean() {
	initRisingWave()

	lasted := config.GetReadonlyConfig().Interval.LatestDuring * 2
	risingWave.Exec(context.Background(),
		`DELETE FROM t_github_prs WHERE create_time < @ttl`,
		pgx.NamedArgs{"ttl": time.Now().Add(-time.Second * time.Duration(lasted))},
	)

	risingWave.Exec(context.Background(),
		`DELETE FROM t_developer_id WHERE create_time < NOW() - INTERVAL '1 year'`,
	)

	risingWave.Exec(context.Background(),
		`DELETE FROM t_repository_id WHERE create_time < NOW() - INTERVAL '1 year'`,
	)
}
