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
	"encoding/json"
	"fmt"
	"github.com/google/go-github/v47/github"
	"testing"
)

func TestGetFieldToMap(t *testing.T) {
	filter := []string{"id", "type", "actor.login", "actor.avatar_url", "payload.push_id", "payload.commits"}
	event := github.Event{}
	msg, _ := json.Marshal(event)
	fmt.Println(FilterMessageToMap(msg, filter))
}
