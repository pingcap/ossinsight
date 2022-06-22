---
title: 'Step 1: Find Data Source'
sidebar_position: 1
---

GitHub was launched in April 2008, and the /events api was published in Feb 2011, so there is a big amount of both historical and realtime data.

:::info GitHub API Docs
Link: https://docs.github.com/en/rest/activity/events
:::note

## 1. Historical GitHub events

We can't fetch the historical data from GitHub api, but fortunately, they were archived on https://gharchive.org (thanks to this project).

GitHub provides 20+ event types, which range from new commits and fork events, to opening new tickets, commenting, and adding members to a project. These events are aggregated into hourly archives, which you can access with any HTTP client:

| Query | Command |
| ---- | ---- |
| Activity for 1/1/2015 @ 3PM UTC |	`wget https://data.gharchive.org/2015-01-01-15.json.gz` |
| Activity for 1/1/2015 | `wget https://data.gharchive.org/2015-01-01-{0..23}.json.gz` |
| Activity for all of January 2015 | `wget https://data.gharchive.org/2015-01-{01..31}-{0..23}.json.gz` |


## 2. Realtime GitHub events


Usage:
```bash
curl \
  -H "Accept: application/vnd.github.v3+json" \ 
  -H "Authorization: token <TOKEN>" \
  https://api.github.com/events
```
