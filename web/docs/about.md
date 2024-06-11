---
sidebar_position: 1
title: About OSS Insight
description: OSS Insight is a powerful insight tool that can help you analyze any GitHub repository or developer. And you can get insights with the monthly and historical rankings as well.
hide_title: true
---

<h1 align="center"> About OSS Insight 👁️</h1>

<h3 align="center">
  <b><a href="/explore">GitHub Data Explorer</a></b>
  •
  <b><a href="/collections/open-source-database">Rankings</a></b>
  •
  <b><a href="/analyze/Ovilia">Developer Analytics</a></b>
  •
  <a href="/analyze/pingcap/tidb">Repository Analytics</a>
  •
  <a href="/collections/open-source-database">Collections</a>
  •
  <a href="/docs/workshop">Workshop</a>
  •
  <a href="/blog">Blogs</a>
  •
  <a href="https://twitter.com/OSSInsight">Twitter</a>
</h3>

OSS Insight is a powerful tool that provides comprehensive, valuable, and trending insights into the open source world by analyzing 5+ billion rows of GitHub events data.

OSS Insight's <a href="/explore">GitHub Data Explorer</a> provides a new way to explore GitHub data. Simply ask your question in natural language and GitHub Data Explorer will generate SQL, query the data, and present the results visually.

OSS Insight also provides in-depth analysis of individual GitHub repositories and developers, as well as the ability to compare two repositories using the same metrics.

<div align="center">
<iframe width="560" height="315" src="https://www.youtube.com/embed/6ofDBgXh4So?enablejsapi=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<br />

## Feature 1: GPT-Powered Data Exploration

GitHub Data Explorer provides a new way to discover trends and insights into 5+ billion rows of GitHub data.
Simply ask your question in natural language and GitHub Data Explorer will generate SQL, query the data, and present the results visually. It's built with <a href ="https://tidbcloud.com/channel/?utm_source=ossinsight&utm_medium=community&utm_campaign=chat2query_202301&utm_content=about">Chat2Query</a>, a GPT-powered SQL generator in TiDB Cloud. 

Examples:
- [Projects similar to @facebook/react](https://ossinsight.io/explore?id=ba186a53-b2ab-4cad-a46f-e2c36566cacd)
- [The most interesting Web3 projects](https://ossinsight.io/explore?id=f829026d-491c-44e0-937a-287f97a3cba7)
- [Where are @kubernetes/kubernetes contributors from?](https://ossinsight.io/explore?id=754a681e-913f-4333-b55d-dbd8598bd84d)
- [More popular questions](https://ossinsight.io/explore/)

<div align="center">
<iframe width="560" height="315" src="https://www.youtube.com/embed/rZZfgOJ-quI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

<br />

## Feature 2: Technical Fields Analytics

- **GitHub Collections Analytics**

  Find insights about the monthly or historical rankings and trends in technical fields with curated repository lists.

  <div align="center">
    <img src="/img/screenshots/homepage-collection.png" alt="GitHub Collections Analytics" height="500" />
  </div>

  Examples：

  - [Collection: Web Framework](https://ossinsight.io/collections/web-framework)
  - [Collection: Artificial Intelligence](https://ossinsight.io/collections/artificial-intelligence)
  - [Collection: Web3](https://ossinsight.io/collections/web3)
  - [More](https://ossinsight.io/collections/open-source-database) ...

  **Welcome to add collections**

  👏 We welcome your contributions here! You can add a collection on our website by submitting PRs. Please create a `.yml` file under [the collections file path](https://github.com/pingcap/ossinsight/tree/main/etl/meta/collections).

  [Here](https://github.com/pingcap/ossinsight/blob/main/CONTRIBUTING.md#add-a-collection) is a file template that describes what you need to include. We look forward to your PRs！

- **Deep Insight into some popular fields of technology**

  Share with you many deep insights into some popular fields of technology, such as open source Databases, JavaScript Framework, Low-code Development Tools and so on.

  Examples：

  - [Deep Insight Into Open Source Databases](https://ossinsight.io/blog/deep-insight-into-open-source-databases)
  - [JavaScript Framework Repos Landscape 2021](https://ossinsight.io/blog/deep-insight-into-js-framework-2021)
  - [Web Framework Repos Landscape 2021](https://ossinsight.io/blog/deep-insight-into-web-framework-2021)
  - [More](https://ossinsight.io/blog) ...

  We’ll also share the SQL commands that generate all these analytical results above each chart, so you can use them on your own on TiDB Cloud following this [10-minute tutorial](https://ossinsight.io/blog/try-it-yourself/).

<br />

## **Feature 3: Developer Analytics**

Insights about **developer productivity**, **work cadence**, and **collaboration** from developers' contribution behavior.

- Basic:
  - Stars, behavior, most used languages，and contribution trends
  - Code (commits, pull requests, pull request size and code line changes), code reviews, and issues
- Advanced:
  - Contribution time distribution for all kind of contribution activities
  - Monthly stats about contribution activities in all public repositories

<div align="center">
    <img src="/img/screenshots/homepage-developer.png" alt="Developer Analytics" height="500" />
</div>

<br />

## Feature 4: Repository Analytics

Insights about the **code update frequency & degree of popularity** from repository’s status.

* Basic:
  * star, fork, issues, commits, pull requests, contributors, programming languages, lines of code modified
  * Historical Trends of these metrics 
  * Time Cost of issues, pull requests

* Advanced:
  * Geographical Distribution of stargazers, issue creators, pull requests creators
  * Company Distribution of stargazers, issue creators, pull requests creators

<div align="center">
    <img src="/img/screenshots/homepage-repository.png" alt="Repository Analytics" height="500" />
</div>

Examples:
* [React](https://ossinsight.io/analyze/facebook/react)
* [TiDB](https://ossinsight.io/analyze/pingcap/tidb)
* [web3.js](https://ossinsight.io/analyze/web3/web3.js)
* [Ant Design](https://ossinsight.io/analyze/ant-design/ant-design)
* [Chaos Mesh](https://ossinsight.io/analyze/chaos-mesh/chaos-mesh)

<br />

## Feature 5: Compare Projects

Compare two projects using the repo metrics mentioned in **Repository Analytics**.

Examples:

- [Compare Vue and React](https://ossinsight.io/analyze/vuejs/vue?vs=facebook/react)
- [Compare CockroachDB and TiDB](https://ossinsight.io/analyze/pingcap/tidb?vs=cockroachdb/cockroach)
- [Compare PyTorch and TensorFlow](https://ossinsight.io/analyze/pytorch/pytorch?vs=tensorflow/tensorflow)

<br />

## Sponsors

<div align="center">
  <a href="https://www.pingcap.com/tidb-serverless/?utm_source=ossinsight&utm_medium=referral">
    <img src="/img/tidb-cloud-logo-w.png" alt="tidb cloud logo" height="20" />
  </a>
</div>
