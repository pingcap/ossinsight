---
title: 'Step 1: Setup TiDB Serverless'
sidebar_position: 2
---

## Signup TiDB Cloud

Register for a TiDB Cloud account at [https://tidbcloud.com/signup](https://tidbcloud.com/channel/?utm_source=ossinsight).

## Create a serverless cluster

Create a serverless cluster in the TiDB Cloud dashboard.

1. Make sure select `Serverless` in `Choose a Tier` section;
2. Leave other as default;


## Get connection info

1. Click `Connect` on top right;
2. Select `Connect With` then you will see:

  ```config
  host: 'gateway01.<your_region>.prod.aws.tidbcloud.com'
  port: 4000, 
  user: 'xxxxxxxxxxxxxxx.root', 
  password: '<your_password>', 
  ```
