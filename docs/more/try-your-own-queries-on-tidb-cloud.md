---
title: Try your own queries on TiDB Cloud
---

You can apply for a free TiDB Cloud instance to analyze GHArchive data yourself. We provided the full github_events data on 2020-01-01, and a db_repos table.

## Register a free TiDB Cloud account

You can register a free TiDB Cloud account via this link:

https://tidbcloud.com/signup

Once registered, you can create a free cluster. You can refer to this video, remember to choose AWS when creating an instance

<iframe width="100%" height="350" src="https://www.youtube.com/embed/XQ-RFvsS9cw?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Import GHArchive data

![](/img/how-it-works/import.png)

1. Bucket URL: s3://gharchivetest/data/
2. Role-ARN: arn:aws:iam::098246302477:role/tidbcloud
3. Bucket Region: US West(Oregon)
4. Data Format: TiDB Dumpling
5. Fill your password
6. Submit

![](/img/how-it-works/fill.png)

## Connect to your cluster

Click the connect link:
![](/img/how-it-works/connect.png)

Open the SQL shell in browser
![](/img/how-it-works/web-shell.png)

## Create TiFlash replicas for tables

After entering the password, you are successfully connected to the SQL shell, let's create TiFlash replicas for github_events and db repos table:

```sql
use gharchive_dev;
ALTER TABLE github_events SET TIFLASH REPLICA 1;
ALTER TABLE db_repos SET TIFLASH REPLICA 1;
```

Besides using SQL shell to connect to TiDB cloud, you can also use mysql client or BI tools such as metabase, have fun.

<iframe width="100%" height="350" src="https://www.youtube.com/embed/D_HWON0PdTc?controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

