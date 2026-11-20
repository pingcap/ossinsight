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
| Embedded widgets and chart images from `next.ossinsight.io` | Frozen. Each image shows its last snapshot with a note that it no longer updates. |
| Accounts and saved questions | Sign-in is retired. Account records and saved questions are deleted after the shutdown. |

## The data stays available

The dataset behind OSSInsight will be published as Parquet files that anyone can download: the GitHub event history, repository metadata, and the aggregate tables that power the site. It does not include OSSInsight account data.

Files will be listed at [ossinsight.io/data](https://ossinsight.io/data) as they are published, together with the schema, the time range each table covers, and known gaps in the data. The export is large, so the full set may finish after December 4. The download page will stay online after the shutdown.

## What you should do

- **If you call the API**, move off it before December 4. API responses will carry `Deprecation` and `Sunset` headers until then. The raw event data that OSSInsight is built on comes from [GH Archive](https://www.gharchive.org/), which remains available.
- **If your README embeds an OSSInsight widget or chart**, see the next section. You do not have to change anything before December 4, but the image will stop updating.
- **If you want to keep a chart or a result**, export or screenshot it now.

## Widgets in your README

Many READMEs and profile pages embed OSSInsight widgets from `next.ossinsight.io`. Here is what happens to them:

- **Until December 4, 2026**, widgets keep working and keep updating. In the coming days a short notice will appear under each image to say that it stops on December 4.
- **From December 4, 2026**, each widget shows its last snapshot, with a note that OSSInsight has shut down and the image no longer updates. Your README will not show a broken image.
- A widget that nobody opened during the notice period has no snapshot. It shows a one-line notice instead.
- Links to widget pages on `next.ossinsight.io` will redirect to this post.

A frozen chart gets less accurate over time, so we recommend replacing or removing the widget when convenient.

## The source code

The code stays public under the Apache 2.0 license at [github.com/pingcap/ossinsight](https://github.com/pingcap/ossinsight). The repository will be archived after the shutdown.

## Questions

Open an issue on [GitHub](https://github.com/pingcap/ossinsight/issues) and we will answer there.

Thank you to everyone who used OSSInsight, contributed collections and fixes, and shared what they found.
