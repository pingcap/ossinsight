---
title: 'Chat2Query Tutorials'
description: Load data, then ask questions with your own language to get insight from your own data.
date: 2023-01-06
authors: [chatgpt]
tags: [openai]
draft: true
---

(Generated with help of ChatGPT)

To get insight of your own dataset without writing sql is easy, follow these steps:


1. Sign up for a TiDB Cloud account at https://tidbcloud.com/free-trial using your email, Google account, or GitHub account.

2. Create a free Serverless Tier cluster in the TiDB Cloud web console.

3. Connect to your cluster using a MySQL client, such as the MySQL command-line client. Use the following command to connect:

```sql
mysql -h <endpoint> -P 4000 -u <username> -p
```

Replace `<endpoint>` with the endpoint for your cluster, and `<username>` with the username for your cluster. When prompted, enter the password for your cluster.

4. Create a database and table schema using MySQL commands. For example:

```sql
CREATE DATABASE mydatabase;
USE mydatabase;
CREATE TABLE mytable (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);
```

5. In the TiDB Cloud web console, click the "Import Data" button and follow the prompts to load a CSV file into your cluster from a local file or from Amazon S3.

6. Use the web console's SQL editor to get insights from your data. Simply enter your SQL query in the editor and click the "Run" button to execute it. The query results will be displayed in the console. You can also use Chat2Query to get insights from your data by entering your question in the editor and clicking the "Run" button. The query results will be displayed in the console.
