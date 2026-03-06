// Copyright 2022 PingCAP, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"github.com/pingcap-inc/ossinsight-plugin/fetcher"
	"github.com/pingcap-inc/ossinsight-plugin/interval"
	"runtime"
	"runtime/debug"
	"time"
)

func main() {
	// Fixed time zone
	time.Local = time.UTC
	// Limit the memory usage as 512 MiB
	const maxMemory = 512 * 1024 * 1024
	debug.SetMemoryLimit(maxMemory)

	// Limit the CPU usage as 1 core
	runtime.GOMAXPROCS(1)

	readOnlyConfig := config.GetReadonlyConfig()
	// start to fetch GitHub events and send to message queue

	if !readOnlyConfig.Disable.Producer {
		go fetcher.InitLoop()
	}

	if !readOnlyConfig.Disable.Interval {
		go interval.InitInterval()
	}

	// start to consume message
	startConsumeMessage()

	createWebsocket()

	wait := make(chan int)
	<-wait
}
