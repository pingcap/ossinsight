---
title: Why We Choose TiDB to Support OSS Insight
date: 2022-05-02
authors: [ilovesoup]
---

Many times we hope that our data access becomes more real-time. It has diffrrent meanings for various industries. For logistics, it means that resource allocation can be carried out with a faster frequency. For e-commerce, it means quicker adjustment on promotion strategies based on sales information. It leads to faster risk management and more timely stop losses in finance as well.

![](/img/try-it-yourself/scenerios.png)

For developers, it means realtime insights on topics like the latest and hottest projects in the community, the organizations that contribute the most, the programming languages that are used the most, etc. In case of you want to know more personal information, such as what projects are your friends contributing recently, who contributed the [TiDB](https://github.com/pingcap/tidb/?utm_source=ossinsight)'s most recent PR, etc. Moreover, you want all these in real time.

![](/img/try-it-yourself/top5-languages.png)

Fortunately, the [GH Archive](https://www.gharchive.org/) provides you the basic data to answer these questions. All you need is a database supporting these query. So simple!

In fact, you may find that it is not easy after you thinking about it carefully. You want the system provide the summary statistics with a large amount of data, such as the ranking of the most popular language in the figure above, as well as a large number of concurrent accesses to individual accounts. 

You might need two systems: one of them focuses on high-concurrency detailed data services, while the other requires insight reports based on a large amount of data. Regardless of Github insights, you might encounter similar problems in your daily work. For example, if you are building a operational gaming data service system, you might face the customer inquery request: "I just looted the sword of infinity, but I can't find it in my backpack now!" You need to quickly locate the loot data of that unlucky player from large volume of records to get a clue of the situation. Did he accidentally destroyed the sword? Is it ninjaed? Does the bored player simply want a chat with GMs? At the mean time, the operation team is also urging: "For the recently launched class Night Lord, please give me the latest damage statistics immediately. I suspect that the Dark Hammer skill is too imba and need a nerf immediately."

**These all require your database to achieve all together:**
1. **Looking for a needle in a haystack**
2. **Quick analytical insights for massive data**
3. **Realtime updates**

In the past, for massive detailed data services, you could choose NoSQL or data sharding. NoSQL is a popular choice for massive hot data storage, but its disadvantages are also quite obvious: you cannot use SQL to express complex semantics, and it also lacks a proper indexing mechanism to locate data through dimensions other than the primary key.  At the meantime, data sharding is quite cumbersome. Scaling the cluster as well as desining the partition key takes you a lot of effort. Moreover, for analytical services , you might need to deploy a dedicated analytical database, and take care of the real-time ETL pipeline. For a small number of mission critical applications, you just grit your teeth and do it. But for the increasingly complex needs of analytics and data services, you need to consider whether it is worthy or not.

In the selection, you want a solution with the SQL capabilities of traditional databases, mature indexing mechanism, real-time reporting ability and scalability.

Yes, [TiDB](https://en.pingcap.com/?utm_source=ossinsight) has them all.

:::note
💡 You can read **[TiDB Documentation](https://docs.pingcap.com/tidb/stable/overview?utm_source=ossinsight)** to get more useful infomation.
:::

As an HTAP database, TiDB has both complete transactions support and high performance analytics at ease. When users want to locate detailed data (such as querying the latest commit records via github ID or affiliated organization), you can build fine-grained indexes for multiple dimensions for fast locating and high concurrency. At the same time,  TiDB's analytics engine, [TiFlash](https://docs.pingcap.com/tidb/stable/tiflash-overview?utm_source=ossinsight) , has built-in support for high-frequency updates. A column storage system (yes, even transactional updates of hundreds of thousands of TPS) that allows data to be seamlessly synchronized in real-time for analysis. Users only need to submit SQL queries without caring about the types of query, and the optimizer will automatically choose the optimal way to evaluate. In fact, it may not be possible for you to precisely distinguish which engine is more suitable. Consider quering for an individual organization: if it is a small organization with three or five people, the Github events since its creation may not exceed 10,000. While for giants like Microsoft and Alibaba, the difference on data volume is in orders of magnitude. In such case, the choice of engines becomes quite subtle, let alone separate the workloads in different databases. For TiDB, the choice is automatic: through statistical estimation, TiDB can "guess" the amount of data accessed and combine it with a cost model to find the most appropriate way to execute.

In fact, in addition to interesting projects like OSS Insight, TiDB has a wide range of applications in similar real-time data insights and services, such as history order serving , advertising , risk management, datahub, logistics tracking and etc.

Unleashing the value of real-time data has become more and more important, and hope [TiDB](https://docs.pingcap.com/tidb/stable/overview?utm_source=ossinsight) can lend you a helping hand.

:::info
### 🌟 Details in how OSS Insight works

Go to read [Use TiDB Cloud to Analyze GitHub Events in 10 Minutes](/blog/try-it-yourself) and use the [Developer Tier](https://tidbcloud.com/signup?utm_source=ossinsight) **free** for 1 year.

You can find how we deal with massive github data in [Data Preparation for Analytics](/blog/how-it-works) as well!
:::
