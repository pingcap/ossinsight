package config

// Api
type Api struct {
	Version int `yaml:"version"`
}

// Server
type Server struct {
	Port      int    `yaml:"port"`
	Health    string `yaml:"health"`
	SyncEvent string `yaml:"syncEvent"`
}

// Interval
type Interval struct {
	Retry        int    `yaml:"retry"`
	RetryWait    int    `yaml:"retryWait"`
	Daily        string `yaml:"daily"`
	Latest       string `yaml:"latest"`
	LatestDuring int    `yaml:"latestDuring"`
}

// Risingwave
type Risingwave struct {
	Password string `yaml:"password"`
	Db       string `yaml:"db"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
}

// Github
type Github struct {
	Loop   Loop     `yaml:"loop"`
	Tokens []string `yaml:"tokens"`
}

// Loop
type Loop struct {
	Timeout int `yaml:"timeout"`
	Break   int `yaml:"break"`
}

// Log
type Log struct {
	Format string `yaml:"format"`
	Level  string `yaml:"level"`
	File   string `yaml:"file"`
}

// Sql
type Sql struct {
	EventsDaily string `yaml:"eventsDaily"`
	Yearly      string `yaml:"yearly"`
}

// Lark
type Lark struct {
	SignKey             string `yaml:"signKey"`
	MinimumBreak        int    `yaml:"minimumBreak"`
	ErrorTolerance      int    `yaml:"errorTolerance"`
	ErrorToleranceBreak int    `yaml:"errorToleranceBreak"`
	Webhook             string `yaml:"webhook"`
}

// Consumer
type Consumer struct {
	Name        string `yaml:"name"`
	Concurrency int    `yaml:"concurrency"`
	Topic       string `yaml:"topic"`
}

// Disable
type Disable struct {
	Producer bool `yaml:"producer"`
	Interval bool `yaml:"interval"`
}

// Config
type Config struct {
	Tidb       Tidb       `yaml:"tidb"`
	Risingwave Risingwave `yaml:"risingwave"`
	Api        Api        `yaml:"api"`
	Server     Server     `yaml:"server"`
	Lark       Lark       `yaml:"lark"`
	Pulsar     Pulsar     `yaml:"pulsar"`
	Github     Github     `yaml:"github"`
	Interval   Interval   `yaml:"interval"`
	Disable    Disable    `yaml:"disable"`
	Log        Log        `yaml:"log"`
}

// Tidb
type Tidb struct {
	Db       string `yaml:"db"`
	Sql      Sql    `yaml:"sql"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

// Pulsar
type Pulsar struct {
	Consumer Consumer `yaml:"consumer"`
	Env      string   `yaml:"env"`
	Host     string   `yaml:"host"`
	Audience string   `yaml:"audience"`
	Keypath  string   `yaml:"keypath"`
	DevHost  string   `yaml:"devHost"`
	Producer Producer `yaml:"producer"`
}

// Producer
type Producer struct {
	Topic string `yaml:"topic"`
	Retry int    `yaml:"retry"`
}

