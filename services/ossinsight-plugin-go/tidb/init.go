package tidb

import (
	"crypto/tls"
	"database/sql"
	"fmt"
	"github.com/go-sql-driver/mysql"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"sync"
)

var (
	initDBOnce sync.Once
	tidb       *sql.DB
)

func createDB() {
	tidbConfig := config.GetReadonlyConfig().Tidb

	err := mysql.RegisterTLSConfig("tidb", &tls.Config{
		MinVersion: tls.VersionTLS12,
		ServerName: tidbConfig.Host,
	})
	if err != nil {
		panic(err)
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&tls=tidb",
		tidbConfig.User, tidbConfig.Password, tidbConfig.Host, tidbConfig.Port, tidbConfig.Db)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}

	tidb = db
}
