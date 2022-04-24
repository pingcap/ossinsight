---
title: "Build a Real-time Analytics Dashboard in Logistics Industry with Metabase"
tags:
  - Real-time analytics
  - Proliferate data
  - Logistics industry
---

`#Real-time analytics`
&nbsp;
`#Proliferate data`
&nbsp;
`#Logistics industry`

In this tutorial, you will build a prototype for PingExpress_DemoCorp’s real-time analytics dashboard that runs on a TiDB Cloud Proof-of-Concept (PoC) cluster.

![](https://en.pingcap.com/wp-content/uploads/2022/03/Metabase-dashboard-overview.png)

> Disclaimer:
> 
* PingExpress_DemoCorp is a dummy company. It does NOT reflect or imply any real company.
* This tutorial is for demonstration purposes only. Do NOT use any material (including but not limited to code, and commands) from this tutorial in production environments.


PingExpress_DemoCorp is a supply chain management company in the United States. With more people shopping online due to the pandemic, it’s business has scaled rapidly. They’re delivering tens of billions of packages a year.

With so many deliveries, a key part of their success is accurate and efficient package tracking. Business managers need to know where packages are so they can identify potential traffic blocks and rearrange delivery routes. Customers need accurate delivery dates so they can plan ahead. Therefore, real-time tracking, status updates, and a detailed dashboard are very important to PingExpress_DemoCorp.

**With the current technology infra, PingExpress_DemoCorp is facing growing pains:**

PingExpress_DemoCorp uses MySQL. For a real-time dashboard, they need to use both historical data and new data coming in. Data analytics rely on stored procedures. As business roars, more data needs to be stored. The MySQL sharding solution can’t meet their requirements, and the system is hard to scale and maintain.
During peak hours, the performance on a standalone machine is poor. There is also high risk of a single-point failure.


**PingExpress_DemoCorp considered two options:**

> **Option A:** Add a dedicated column store to the existing data stack to separate the OLTP workload from the OLAP workload.

> **Option B:** Replace MySQL database with TiDB, which contains both the row store for daily transactions and the column store for analytical workloads.

PingExpress_DemoCorp chose **option B**. 

This is because adding another column storage for analysis workload makes the system more complicated. At the same time, data has to be synchronized from the row store to the column store via painful ETL processes over night. This means that choosing option A still does not enable PingExpress_DemoCorp to do real-time analytics.

**On the other hand, switching to [TiDB Cloud](https://en.pingcap.com/tidb-cloud/?utm_source=ossinsight)   as the backend database is very attractive to PingExpress_DemoCorp：**

In this tutorial, you will build a prototype for PingExpress_DemoCorp’s real-time analytics dashboard that runs on a 
TiDB Cloud Proof-of-Concept (PoC) cluster.

## Before you begin

You should have the following software and packages installed:

* Python (v. 3+)
* MySQL connector for Python
* SQLAlchemy
* sqlalchemy-tidb
* Metabase


Note: It is recommended to use pip3 to install packages, such as SQLAlchemy. We also suggest NOT to use the Mac application version for Metabase. It is gradually being phased out. You may use the jar version instead.

:::info
** We recomand you Start with [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud/?utm_source=ossinsight) and finish this [10-minute tutorial](https://ossinsight.io/blog/try-it-yourself/) first.**
:::

## 1. Create a dashboard.

1. In the top right corner of the dashboard, click the **+** sign, and then choose **New Dashboard**.
2. Enter the name as **PingExpress_dashboard**.
3. Click ***Create***.

## 2. Add a question.

1. In the top right corner, click **Ask a question** on the top right corner, and then choose **Native query**.
2. Select **PingExpressDB** as the database.
3. Display the total number of packages delivered. Enter the following query and click the right side of the screen to run it:
`SELECT COUNT(*) FROM packages WHERE transaction_kind="4_pkg_out";`

## 3. Save the question.

1. In the upper right corner, click **Save**.
2. Enter the name **Total packages delivered**.
3. When being asked if you would like to add this question to the dashboard, click **Yes please!**, and choose **PingExpress_dashboard**.
The result will now appear on the dashboard.
4. Click **Save**.

## 4. Repeat steps 2 and 3 for the second question, “Number of packages on the way.” This is the query to use:

`SELECT COUNT(*) FROM packages WHERE transaction_kind != "4_pkg_out";`

## 5. Visualize the **Number of packages in process in each state**.

1. Repeat step 3 and use the following query instead.
`SELECT start_state, COUNT(package_id)`
2. After getting the result, click the **Visualization** button, and then choose **Map**. For the map options:
 * Map Type: Region map
 * Region Map: United States
 * Leave everything else as default.

3. Repeat step 4 and add this question to the dashboard.
![](https://en.pingcap.com/wp-content/uploads/2022/03/Add-questions-to-dashboard-768x602.png)

## 6. (Optional) Repeat the previous steps to add two more queries:
1. Number of packages in each stage (pie chart):
`SELECT transaction_kind, count(*) `

2. Number of new packages per day (line chart):
`SELECT DATE(start_time), count(*) `
