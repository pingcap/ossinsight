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
| language | enum(All,JavaScript,Java,Python,PHP,Rust,Go,Kotlin,PowerShell...) | yes |
| period | enum(past_24_hours,past_week,past_month) | yes |

## Example

`https://api.ossinsight.io/q/trending-repos?language=All&period=past_24_hours`
