<h1 align="center">Open Source Software Insight!</h1>

<div align="center">
<a href="https://ossinsight.io">
  <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/screenshots/homepage.gif"
</a>
</div>

<h4 align="center">
  <b><a href="https://ossinsight.io/explore/">Data Explorer</a></b>
  •
  <b><a href="https://ossinsight.io/collections/open-source-database">Repo Rankings</a></b>
  •
  <b><a href="https://ossinsight.io/analyze/Ovilia">Developer Analytics</a></b>
  •
  <a href="https://ossinsight.io/analyze/pingcap/tidb">Repo Analytics</a>
  •
  <a href="https://ossinsight.io/collections/open-source-database">Collections</a>
  •
  <a href="https://ossinsight.io/docs/workshop">Workshop</a>
  •
  <a href="https://ossinsight.io/blog">Blog</a>
  •
  <a href="https://ossinsight.io/docs">API</a>
  •
  <a href="https://twitter.com/OSSInsight">Twitter</a>
</h3>

## Introduction

OSS Insight is a powerful tool that provides comprehensive, valuable, and trending insights into the open source world by analyzing 10+ billion rows of GitHub events data.

OSS Insight's <a href="https://ossinsight.io/explore/">Data Explorer</a> provides a new way to explore GitHub data. Simply ask your question in natural language and Data Explorer will generate SQL, query the data, and present the results visually.

OSS Insight also provides in-depth analysis of individual GitHub repositories and developers, as well as the ability to compare two repositories using the same metrics.
  
[🎦 Video - OSS Insight: Easiest New Way to Analyze Open Source Software](https://www.youtube.com/watch?v=6ofDBgXh4So&t=1s)

### **Feature 1: GPT-Powered Data Exploration**
  
Data Explorer provides a new way to discover trends and insights into 5+ billion rows of GitHub data.

Simply ask your question in natural language and Data Explorer will generate SQL, query the data, and present the results visually. It's built with <a href="https://tidbcloud.com/channel/?utm_source=ossinsight&utm_medium=community&utm_campaign=chat2query_202301&utm_content=github_readme">Chat2Query</a>, a GPT-powered SQL generator in TiDB Cloud. 

Examples:

* [Projects similar to @facebook/react](https://ossinsight.io/explore?id=ba186a53-b2ab-4cad-a46f-e2c36566cacd)
* [The most interesting Web3 projects](https://ossinsight.io/explore?id=f829026d-491c-44e0-937a-287f97a3cba7)
* [Where are @kubernetes/kubernetes contributors from?](https://ossinsight.io/explore?id=754a681e-913f-4333-b55d-dbd8598bd84d)
* [More popular questions](https://ossinsight.io/explore/)

[🎦 Video - Data Explorer: Discover insights in GitHub data with GPT-generated SQL](https://www.youtube.com/watch?v=rZZfgOJ-quI)

### **Feature 2: Technical Fields Analytics 👁️**

* **GitHub Collections Analysis**
  
  Find insights about the monthly or historical rankings and trends in technical fields with curated repository lists.

<div align="center">
  <a href="https://en.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral">
     <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/screenshots/homepage-collection.png" alt="GitHub Collections Analytics" height="500" />
  </a>
</div>


  **Examples**:
  
  * [Collection: Web Framework](https://ossinsight.io/collections/web-framework)
  * [Collection: Artificial Intelligence](https://ossinsight.io/collections/artificial-intelligence)
  * [Collection: Web3](https://ossinsight.io/collections/web3)
  * [More](https://ossinsight.io/collections/open-source-database) ...

  **Welcome to add collections**

  👏 We welcome your contributions here! You can add a new collection or add repositories to an existing collection by submitting PRs to [`etl/meta/collections/`](https://github.com/pingcap/ossinsight/tree/main/etl/meta/collections).

  * **Add repos to an existing collection**: Edit the corresponding `.yml` file and append repository names to the `items` list.
  * **Add a new collection**: Create a new `.yml` file named `<id>.<name>.yml` with the following format:

  ```yml
  id: <collection_id>
  name: <collection_name>
  items:
    - owner/repo-1
    - owner/repo-2
  ```

* **Deep Insight into some popular fields of technology**
  
  Share with you many deep insights into some popular fields of technology, such as open source Databases, JavaScript Framework, Low-code Development Tools and so on.

   **Examples**:
  * [Deep Insight Into Open Source Databases](https://ossinsight.io/blog/deep-insight-into-open-source-databases)
  * [JavaScript Framework Repos Landscape 2021](https://ossinsight.io/blog/deep-insight-into-js-framework-2021)
  * [Web Framework Repos Landscape 2021](https://ossinsight.io/blog/deep-insight-into-web-framework-2021)
  * [More](https://ossinsight.io/blog) ...
  
  We’ll also share the SQL commands that generate all these analytical results above each chart, so you can use them on your own on TiDB Cloud following this [10-minute tutorial](https://ossinsight.io/blog/try-it-yourself/).

### **Feature 3: Developer Analytics**

Insights about **developer productivity**, **work cadence**, and **collaboration** from developers' contribution behavior.

* **Basic**:
  * Stars, behavior, most used languages，and contribution trends
  * Code (commits, pull requests, pull request size and code line changes), code reviews, and issues
* **Advanced**:
  * Contribution time distribution for all kind of contribution activities
  * Monthly stats about contribution activities in all public repositories

<div align="center">
    <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/screenshots/homepage-developer.png" alt="Developer Analytics" height="500" />
</div>

### **Feature 4: Repository Analytics**

Insights about the **code update frequency & degree of popularity** from repositories' status.

* **Basic**:
  * Stars, forks, issues, commits, pull requests, contributors, programming languages, and lines of code modified
  * Historical trends of these metrics
  * Time cost of issues, pull requests
* **Advanced**:
  * Geographical distribution of stargazers, issue creators, and pull request creators
  * Company distribution of stargazers, issue creators, and pull request creators

<div align="center">
    <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/screenshots/homepage-repository.png" alt="Repository Analytics" height="500" />
</div>

**Examples**:

* [React](https://ossinsight.io/analyze/facebook/react)
* [TiDB](https://ossinsight.io/analyze/pingcap/tidb)
* [web3.js](https://ossinsight.io/analyze/web3/web3.js)
* [Ant Design](https://ossinsight.io/analyze/ant-design/ant-design)
* [Chaos Mesh](https://ossinsight.io/analyze/chaos-mesh/chaos-mesh)

### **Feature 5: Compare Projects 🔨**

Compare two projects using the repo metrics mentioned in **Repository Analytics**.

**Examples**:
* [Compare Vue and React](https://ossinsight.io/analyze/vuejs/vue?vs=facebook/react)
* [Compare CockroachDB and TiDB](https://ossinsight.io/analyze/pingcap/tidb?vs=cockroachdb/cockroach)
* [Compare PyTorch and TensorFlow](https://ossinsight.io/analyze/pytorch/pytorch?vs=tensorflow/tensorflow)
  
## Contribution

We've released OSS Insight because it can do more insights about GitHub. We hope that others can benefit from the project. We are thankful for any contributions from the community.

* [GitHub Discussions](https://github.com/pingcap/ossinsight/discussions): help with building, discussion about best practices.
* [GitHub Issues](https://github.com/pingcap/ossinsight/issues): bugs, feature requests, and collection suggestions.
* [GitHub PRs](https://github.com/pingcap/ossinsight/pulls): pull requests for features, fixes, and blog posts.

## Contact

We have a few channels for contact:

* [GitHub Discussions](https://github.com/pingcap/ossinsight/discussions): You can ask a question or discuss here.
* [@OSS Insight](https://twitter.com/OSSInsight) on Twitter
* [TiDB Community](https://ask.pingcap.com/): This is the place to discuss anything related to TiDB.
* [mail](mailto:ossinsight@pingcap.com):If you want to analyze more, please [contact us](mailto:ossinsight@pingcap.com) ✉️

## Development

```bash
pnpm install
pnpm dev        # Start web app (port 3001)
pnpm dev:docs   # Start docs site (port 3002)
pnpm dev:all    # Start both
```

## Sponsors

<div align="center">
  <a href="https://en.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral">
    <img src="https://raw.githubusercontent.com/pingcap/ossinsight/main/apps/docs/public/img/tidb-cloud-logo-w.png" height=50 />
  </a>
</div>
