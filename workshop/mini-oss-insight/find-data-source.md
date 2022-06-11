---
title: 'Step 1: Find Data Source'
sidebar_position: 1
---

## 1. Historical GitHub events

The whole historical GitHub events data since 2011 is hosted on https://gharchive.org

Rules: 

| Query | Download Link |
| ---- | ---- |
| Activity for 1/1/2015 @ 3PM UTC |	`https://data.gharchive.org/2015-01-01-15.json.gz` |
| Activity for 1/1/2015 | `https://data.gharchive.org/2015-01-01-{0..23}.json.gz` |
| Activity for all of January 2015 | `https://data.gharchive.org/2015-01-{01..31}-{0..23}.json.gz` |


## 2. Realtime GitHub events

GitHub API Docs: https://docs.github.com/en/rest/activity/events

Usage:
```bash
curl \
  -H "Accept: application/vnd.github.v3+json" \ 
  -H "Authorization: token <TOKEN>" \
  https://api.github.com/events
```
