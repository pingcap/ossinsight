---
title: 'Workshop: Twitter Insight'
sidebar_label: Twitter Insight
sidebar_position: 4
---

[Twitter](http://twitter.com/) is the leading social media in the world, the tweets analysis must be very very interesting:
* Who is mentioned the most
* What is the trends
* A specific user's tweets?

## Step 1: Find Data Source

### Historical Tweets Data

After Google, here is a topic about how to retrive archive tweets data:  https://developer.twitter.com/en/docs/tutorials/getting-historical-tweets-using-the-full-archive-search-endpoint


### Realtime Tweets

Here is a topic about `Listen for important events`: https://developer.twitter.com/en/docs/tutorials/listen-for-important-events

For example, `Staying informed on a topic of interest`:

```bash
curl -X POST 'https://api.twitter.com/2/tweets/search/stream/rules' \
-H "Content-type: application/json" \
-H "Authorization: Bearer $BEARER_TOKEN" -d \
'{
  "add": [
    {"value": "from:twitterdev from:twitterapi has:links"}
  ]
}'
```

## Step 2: Load Data to TiDB

(We won't implement this, you can try it :-)

## Step 3: Get Insights

(We won't implement this, you can try it :-)
