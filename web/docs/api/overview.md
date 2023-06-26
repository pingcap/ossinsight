---
sidebar_position: 0
title: API Overview
description: OSS Insight API Overview
sidebar_label: API Overview
slug: /api
---

:::info

If you want to get your own data or some repos' data, you can setup our new repo that could crawl you GitHub activities data into a free database, and customize your insight with SQL!

👉 [Click Here!](https://github.com/pingcap/ossinsight-lite).

<img width="1440" alt="Default dashboard" src="https://github.com/pingcap/ossinsight-lite/assets/55385323/0eb143bb-abfb-4d31-8bbc-36da87355f2d" />

:::

If you want to use the OSS Insight API in your application, you can do one of the following

* Email us at ossinsight@pingcap.com
* [Open a pull request](https://github.com/pingcap/ossinsight/edit/main/web/docs/api/overview.md)


## API host

`https://api.ossinsight.io`


## API CORS

Currently we only enable cross-origin resource sharing (CORS) for these domains:
* *.ossinsight.io
* localhost
* *.github1s.com


## API rate limit

For each IP address, the rate limit allows for up to 60 requests per minute.
