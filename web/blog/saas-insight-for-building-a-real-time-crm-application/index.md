---
title: SaaS Insight for Building a Real-time CRM Application
description: This article describes how to building a real-time CRM application in a better way. Includes the potential database solutions.
image: ./thumbnail.png
date: 2022-05-01
authors: [ilovesoup]
tags: [tidb]
---

> Providing insights on large volume of email data might not be as easy as we thought. While data coming in real-time, indices and metadata are to be built consistently. To make things worse, the data volume is beyond traditional single node databases' reach.

## Background

To store large volumes of real-time user data like email and provide insights is not easy. If your application is layered on top of Gmail to automatically extract and organize the useful information buried inside of our inboxes.

 It became clear that they were going to need a better system for organizing terabytes of email metadata to power collaboration as their customer base rapidly increased, it is not easy to provide insights. You need to organize email data by first applying a unique identifier to the emails and then proactively indexing the email metadata. The unique identifier is what connects the same email headers across. For each email inserted in real-time, the system extracts meta information from it and builds indices for high concurrent access. When data volume is small, it's all good: traditional databases provide all you need. However, when data size grows beyond a single node's capacity, everything becomes very hard.

## Potential Database Solutions

Regarding databases, there are some options you might consider:

1. **NoSQL database.** While fairly scalable, it does not provide you indexing and comprehensive query abilities. You might end up implementing them in your application code.
2. **Sharing cluster of databases.** Designing sharding key and paying attention to the limitations between shards are painful. It might be fine for applications with simple schema designs, but it will be too complicated for CRM. Moreover, it's very hard to maintain.
3. **Analytical databases.** They are fine for dashboard and reporting. But not fine for high concurrent updates and index based serving.

## How to get real-time insights

[TiDB](https://docs.pingcap.com/tidb/stable/overview?utm_source=ossinsight&utm_medium=referral) is a distributed database with user experience of traditional databases. It looks like a super large MySQL without the limitations of NoSQL and sharding cluster solutions. With TiDB, you can simply have the base information, indices and metadata being updated in a concurrent manner with the help of cross-node transaction ability. 

To build such a system, you just need following steps:

1. **Create schemas** according to your access pattern with indices on user name, organization, job title etc.
2. **Use streaming system** to gather and extract meta information from your base data
3. **Insert into TiDB via ordinary MySQL client driver like JDBC.** You might want to gather data in small batches of hundreds of rows to speed up ingestion. In a single transaction, updates on base data, indices and meta information are guaranteed to be consistent.
4. Optionally, **deploy a couple of [TiFlash](https://docs.pingcap.com/tidb/stable/tiflash-overview?utm_source=ossinsight&utm_medium=referral) nodes** to speed up large scale reporting queries.
5. **Access the data** just like in MySQL and you are all done. SQL features for analytics like aggregations, multi-joins or window functions are all supported with great performance.

For more cases, please see [here](https://en.pingcap.com/customers/?utm_source=ossinsight&utm_medium=referral).



:::info
### 🌟 Details in how OSS Insight works

Go to read [Use TiDB Cloud to Analyze GitHub Events in 10 Minutes](/blog/try-it-yourself) and use the [Serverless Tier](https://tidbcloud.com/free-trial/?utm_source=ossinsight&utm_medium=community) TiDB Cloud Cluster.

You can find how we deal with massive github data in [Data Preparation for Analytics](/blog/how-it-works) as well!
:::
