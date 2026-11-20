---
title: "OSSInsight is shutting down on December 4, 2026"
date: 2026-11-20
authors: [OSSInsight]
tags: [announcement]
description: "The live OSSInsight service will be turned off on December 4, 2026. The site stays online as a read-only archive, and the dataset behind it will be published for download."
keywords: [OSSInsight shutdown, OSSInsight sunset, OSSInsight dataset download, GitHub events dataset]
---

We are retiring OSSInsight. The live service will be turned off on **December 4, 2026**.

OSSInsight started in 2022 as a way to explore what billions of GitHub events say about open source. Since then it has grown to more than 12 billion events, and many of you have used it to analyze repositories, compare projects, follow trends, and embed charts in your READMEs. Thank you for that.

This post explains what stops, what stays, and how to keep using the data.

## What changes on December 4, 2026

| Part of OSSInsight | After December 4, 2026 |
| --- | --- |
| `ossinsight.io` | Becomes a read-only archive. The blog and documentation stay online. |
| Live analytics pages (repository, developer and organization analysis, compare, collections, trending) | Stop working. They depend on the live database, which is being shut down. |
| Data Explorer | Retired. |
| Public API at `api.ossinsight.io` | Stops. Every request returns `410 Gone`. |
| Embedded widgets and chart images from `next.ossinsight.io` | Replaced by a static placeholder image. |
| Accounts and saved questions | Sign-in is retired. Account records and saved questions are deleted after the shutdown. |

## The data stays available

The dataset behind OSSInsight will be published as Parquet files that anyone can download: the GitHub event history, repository metadata, and the aggregate tables that power the site. It does not include OSSInsight account data.

Files will be listed at [ossinsight.io/data](https://ossinsight.io/data) as they are published, together with the schema, the time range each table covers, and known gaps in the data. The export is large, so the full set may finish after December 4. The download page will stay online after the shutdown.

## What you should do

- **If you call the API**, move off it before December 4. Until then, API responses carry `Deprecation` and `Sunset` headers. The raw event data that OSSInsight is built on comes from [GH Archive](https://www.gharchive.org/), which remains available.
- **If your README embeds an OSSInsight widget or chart**, remove it or replace it with a static image before December 4.
- **If you want to keep a chart or a result**, export or screenshot it now.

## The source code

The code stays public under the Apache 2.0 license at [github.com/pingcap/ossinsight](https://github.com/pingcap/ossinsight). The repository will be archived after the shutdown.

## Questions

Open an issue on [GitHub](https://github.com/pingcap/ossinsight/issues) and we will answer there.

Thank you to everyone who used OSSInsight, contributed collections and fixes, and shared what they found.
