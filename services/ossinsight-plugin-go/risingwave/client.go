package risingwave

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"sync"
)

var (
	initRisingWaveOnce sync.Once
	risingWave         *pgxpool.Pool
)

func initRisingWave() {
	initRisingWaveOnce.Do(func() {
		rwConfig := config.GetReadonlyConfig().Risingwave

		dsn := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?pool_max_conns=3",
			rwConfig.User, rwConfig.Password, rwConfig.Host, rwConfig.Port, rwConfig.Db)

		fmt.Println(dsn)

		dbcp, err := pgxpool.New(context.Background(), dsn)
		if err != nil {
			panic(err)
		}

		risingWave = dbcp
	})
}
