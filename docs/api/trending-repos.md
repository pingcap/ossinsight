---
sidebar_position: 1
title: GET /q/trending-repos
description: OSS Insight Trending Repos API Overview
sidebar_label: Trending Repos
---

## Endpoint URL

`https://api.ossinsight.io/q/trending-repos`

## Query parameters

| Name | Type | Required |
| --- | --- | --- |
| language | enum(All,JavaScript,Java,Python,PHP,Rust,Go,Kotlin,PowerShell) | yes |
| period | enum(last_day,last_week,last_month) | yes |

## Example

`https://api.ossinsight.io/q/trending-repos?language=All&period=last_day`
