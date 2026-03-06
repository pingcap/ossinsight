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

package lark

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/bluele/gcache"
	"github.com/pingcap-inc/ossinsight-plugin/config"
	"github.com/pingcap-inc/ossinsight-plugin/logger"
	"go.uber.org/zap"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

var lastTimeSent int64 = 0
var cache gcache.Cache

func init() {
	cache = gcache.New(100).Simple().Build()
}

func SendWithToleranceAndFrequencyControl(message string) error {
	larkConfig := config.GetReadonlyConfig().Lark
	timestamp := time.Now().Unix()

	// check tolerance of error num
	cache.SetWithExpire(fmt.Sprintf("%v-%d", timestamp, rand.Int63()), nil, time.Duration(larkConfig.ErrorToleranceBreak)*time.Minute)
	if cache.Len(true) < larkConfig.ErrorTolerance {
		logger.Debug("error tolerance",
			zap.Int("error tolerance", larkConfig.ErrorTolerance),
			zap.Int("error tolerance break", larkConfig.ErrorToleranceBreak),
			zap.Int("error num", cache.Len(true)))
		return nil
	}

	// check minimum break
	if timestamp-lastTimeSent < int64(larkConfig.MinimumBreak)*60 {
		logger.Debug("take a rest",
			zap.Int("minimum break", larkConfig.MinimumBreak),
			zap.Time("last time sent", time.Unix(lastTimeSent, 0)),
			zap.Time("current time", time.Unix(timestamp, 0)))
		return nil
	}
	lastTimeSent = timestamp

	// send message
	sign, err := GenSign(larkConfig.SignKey, timestamp)
	if err != nil {
		return err
	}

	messageBytes, err := json.Marshal(Message{
		Timestamp: strconv.FormatInt(timestamp, 10),
		Sign:      sign,
		MsgType:   "text",
		Content: Content{
			Text: message,
		},
	})
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", larkConfig.Webhook, bytes.NewBuffer(messageBytes))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func GenSign(secret string, timestamp int64) (string, error) {
	stringToSign := fmt.Sprintf("%v", timestamp) + "\n" + secret
	var data []byte
	h := hmac.New(sha256.New, []byte(stringToSign))
	_, err := h.Write(data)
	if err != nil {
		return "", err
	}
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))
	return signature, nil
}
