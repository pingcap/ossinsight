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

package fetcher

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/google/go-github/v47/github"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"github.com/pingcap-inc/ossinsight-plugin/lark"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"github.com/pingcap-inc/ossinsight-plugin/mq"
	"github.com/pingcap-inc/ossinsight-plugin/risingwave"
	"go.uber.org/atomic"
	"golang.org/x/oauth2"
	"sync"
	"time"

	"go.uber.org/zap"
)

var (
	// currentClientIndex round-robin index for client
	currentClientIndex = atomic.NewInt64(0)
	// githubClientList create client by each token
	githubClientList []*github.Client
	// initClientOnce create client once
	initClientOnce sync.Once
)

type Msg struct {
	Event   github.Event           `json:"event"`
	Payload map[string]interface{} `json:"payload"`
}

// InitLoop create loop
func InitLoop() {
	readonlyConfig := config.GetReadonlyConfig()
	loopBreak := readonlyConfig.Github.Loop.Break
	for range time.Tick(time.Duration(loopBreak) * time.Millisecond) {
		go func() {
			logger.Debug("start to request github", zap.Int("loopBreak", loopBreak))
			ProcessSingleRound()
		}()
	}
}

func ProcessSingleRound() {
	events, err := FetchEvents(100)
	if err != nil {
		logger.Error("fetch event error", zap.Error(err))
		return
	}

	for _, event := range events {
		if event.ID == nil {
			logger.Error("event id not exist")
			continue
		}

		// judge event exist
		exists, err := risingwave.EventIDExists(*event.ID)
		if err != nil {
			// If it not exists, we should continue to process the next event.
			// Skip the error log, otherwise the log will be beat all the disk space when the risingwave down.
			// logger.Error("risingwave request error", zap.Error(err))
			lark.SendWithToleranceAndFrequencyControl("risingwave request error, PTAL!")
			continue
		}

		if exists {
			logger.Debug("event already exists, skip it", zap.String("id", *event.ID))
			continue
		}

		// add calculator number
		payload := addEventCount(*event)

		msg := Msg{
			Event:   *event,
			Payload: payload,
		}

		marshaledMsg, err := json.Marshal(msg)
		if err != nil {
			logger.Error("marshal event error", zap.Error(err))
			continue
		}

		err = mq.Send(marshaledMsg, "")
		if err != nil {
			logger.Error("send message error", zap.Error(err))
			continue
		}
	}
}

// FetchEvents fetch GitHub events
func FetchEvents(perPage int) ([]*github.Event, error) {
	client, err := getClient()
	if err != nil {
		logger.Error("get github client error", zap.Error(err))
		return nil, err
	}

	if client == nil {
		logger.Error("github client is nil")
		return nil, fmt.Errorf("github client is nil")
	}

	events, _, err := client.Activity.ListEvents(
		context.Background(), &github.ListOptions{PerPage: perPage})

	if err != nil {
		logger.Error("request github events API error", zap.Error(err))
		return nil, err
	}

	return events, nil
}

// getClient get client by round-robin, this function is concurrent safe
func getClient() (*github.Client, error) {
	initClientOnce.Do(createClients)

	currentCallNum := int(currentClientIndex.Add(1))
	return githubClientList[currentCallNum%len(githubClientList)], nil
}

func createClients() {
	tokens := config.GetReadonlyConfig().Github.Tokens

	for i := range tokens {
		staticTokenSource := oauth2.StaticTokenSource(
			&oauth2.Token{AccessToken: tokens[i]},
		)
		tc := oauth2.NewClient(context.Background(), staticTokenSource)

		githubClientList = append(githubClientList, github.NewClient(tc))
	}
}

func addEventCount(event github.Event) map[string]interface{} {
	result := make(map[string]interface{})

	// All the count metric is for PR
	repo, devDay, devYear, additions, deletions := 0, 0, 0, 0, 0
	// Due to we just calculate the PR event, so the pr metric should always be add 1
	prSign, openSign, mergeSign, closeSign := 1, 0, 0, 0
	language, devID, repoID := "", int64(0), int64(0)

	// Parse event payload

	// Just calculate the PR event
	if event.Type == nil || *event.Type != "PullRequestEvent" {
		return result
	}

	payload, err := event.ParsePayload()
	if err != nil {
		logger.Error("parse payload error", zap.Error(err))
		return result
	}

	prEvent, ok := payload.(*github.PullRequestEvent)
	if !ok || prEvent == nil {
		logger.Error("pr payload not PullRequestEvent type")
		return result
	}

	if prEvent.Action != nil {
		switch *prEvent.Action {
		case "closed":
			if prEvent.PullRequest != nil && prEvent.PullRequest.Merged != nil && *prEvent.PullRequest.Merged {
				mergeSign = 1

				if prEvent.PullRequest.Additions != nil && prEvent.PullRequest.Deletions != nil {
					additions = *prEvent.PullRequest.Additions
					deletions = *prEvent.PullRequest.Deletions
				}
			} else {
				closeSign = 1
			}
		case "opened":
			openSign = 1
		}
	}

	if event.Actor != nil && event.Actor.ID != nil {
		devID = *event.Actor.ID
	}

	if prEvent.PullRequest != nil && prEvent.PullRequest.Base != nil &&
		prEvent.PullRequest.Base.GetRepo() != nil {
		if prEvent.PullRequest.Base.GetRepo().Language != nil &&
			len(*prEvent.PullRequest.Base.GetRepo().Language) != 0 {
			language = *prEvent.PullRequest.Base.GetRepo().Language
		}

		if prEvent.PullRequest.Base.GetRepo().ID != nil {
			repoID = *prEvent.PullRequest.Base.GetRepo().ID
		}
	}

	// Database operations
	err = risingwave.InsertMessage(*event.ID, devID, repoID, *event.CreatedAt, language)
	if err != nil {
		zap.Error(err)
	}

	if devID != 0 {
		devDay = bool2int(risingwave.DevIDTestExistsForToday(devID))
		devYear = bool2int(risingwave.DevIDTestExistsForThisYear(devID))
	}

	if repoID != 0 {
		repo = bool2int(risingwave.RepoIDTestExistsForThisYear(repoID))
	}

	err = risingwave.IncreaseEventDaily(prSign, openSign, mergeSign, closeSign, devDay)
	if err != nil {
		zap.Error(err)
	}

	err = risingwave.IncreaseYearlySum(devYear, repo, additions, deletions)
	if err != nil {
		zap.Error(err)
	}

	result = map[string]interface{}{
		"pr":       prSign,
		"devDay":   devDay,
		"devYear":  devYear,
		"repoYear": repo,
		"merge":    mergeSign,
		"close":    closeSign,
		"open":     openSign,
	}

	return result
}

func bool2int(b bool, err error) int {
	if err != nil {
		zap.Error(err)
		return 0
	}
	if b {
		return 1
	}
	return 0
}
