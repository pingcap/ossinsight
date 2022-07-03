---
title: 'Workshop: Twitter Insight'
sidebar_label: Twitter Insight
sidebar_position: 4
---

[Twitter](http://twitter.com/) is the leading social media in the world, it shows what’s happening and what people are talking about right now.
So if there is a tool which can analyze tweets trend, it will be very very interesting, e.g.:
* How "opensource" is mentioned in the world
* What is the hot event
* Twitter trends?
* ...


## Step 1: Find Data Source

[Twitter API](https://developer.twitter.com/en/docs/twitter-api) enables programmatic access to Twitter in unique and advanced ways. Tap into core elements of Twitter like: Tweets, Direct Messages, Spaces, Lists, users, and more.

### Historical Twitter Data

Get archive tweets data:
```
https://developer.twitter.com/en/docs/tutorials/getting-historical-tweets-using-the-full-archive-search-endpoint
```

### Realtime Twitter Data

#### Events API

Listen for important events:
```
https://developer.twitter.com/en/docs/tutorials/listen-for-important-events.
```

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

#### Sample Code
[Twitter API v2 sample code](https://github.com/twitterdev/Twitter-API-v2-sample-code) provide sample code for the Twitter API v2 endpoints. Individual API features have folders where you can find examples of usage in several coding languages:

* Java
* Node.js
* Python
* R
* Ruby


## Step 2: Load Data to TiDB

_Not ready,  you can try it._


## Step 3: Get Insights with SQL

_Not ready,  you can try it._
