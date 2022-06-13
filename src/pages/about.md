<h1 align="center"> About OSS Insight</h1>

OSS Insight, short for open source software insights, is a powerful insight tool that can help you analyze in depth any single GitHub repository, compare any two repositories using the same metrics, and provide comprehensive, valuable, and trending open source insights. 

OSS Insight is powered by [TiDB](https://github.com/pingcap/tidb), an open source, highly scalable distributed database with hybrid transactional and analytical processing (HTAP) capabilities. The source GitHub data used here in OSS Insight comes from [GH Archive](https://www.gharchive.org/), [GHTorrent](https://ghtorrent.org/), and  [GitHub event API](https://docs.github.com/en/rest/activity/events). We also use [Docusaurus](https://github.com/facebook/docusaurus) to build the OSS Insight website, and [Apache ECharts](https://echarts.apache.org/), to make complicated datasets into visualized charts. 

## What we can do
We provide **monthly rankings and historical growth trends** by metrics such as the number of stars, pull requests, pull requests creators, and commits for many GitHub collections such as open source databases, static site generators, and JavaScript Frameworks.

You can see [Collections](https://ossinsight.io/collections/open-source-database)for more information. 

:::note

### 📌 How to add new collections
Welcome to contribute to us! You can add new collections by **[submitting PRs here](https://github.com/pingcap/ossinsight)**. 

:::

Let’s take the collection [Open Source Databases](https://ossinsight.io/collections/open-source-database) for example and walk you through the major functionalities of OSS Insight. 

### Monthly rankings

We rank the top 27 open source databases on GitHub on a monthly basis according to their number of stars, pull requests, and issues respectively. We also display their rankings change compared to last month under different metrics. 

![The monthly ranking of open source databases in May-I](/img/screenshots/monthly-rankings-of-opensource-databases-in-may-1.png)
![The monthly ranking of open source databases in May-II](/img/screenshots/monthly-rankings-of-opensource-databases-in-may-2.png)

<center><em>The monthly ranking of open source databases in May</em></center>

<br />
<br />

### Dynamic growth trend 
We also analyze, rank, and display the dynamic growth trend of open source databases by metrics including the number of stars, pull requests, pull requests creators, and issues. 

We display the analytical results in three dimensions: **Bar Chart Race, Historical Rankings Change, and Growth Trend of Top 10 Repos**.

#### Bar Chart Race
The **Bar Chart Race** is a visilized and animated demonstration of both the growth trend and rankings change of different open source databases in their number of stars, pull requests, pull request creators, and issues respectively since 2011. 

![The bar chart race by Stars](/img/screenshots/bar-chart-race.png)

<center><em>The bar chart race by Stars</em></center>

<br />
<br />

#### Historical Ranking Change 
As the subtitle indicates, the **Historical Ranking Change** part shows the **annual change of the ranking places** of top 27 open source databases by metrics including the number of stars, pull requests, pull request creators, and issues respectively since 2011. 

![The rankings change of top open source databases by stars since 2011](/img/screenshots/pipeline-chart.png)

<center><em>The rankings change of top open source databases by stars since 2011</em></center>

<br />
<br />

#### Growth Trend of Top 10 Repos
We also use a line chart to show the **monthly growth trend** of top 10 repositories among the collection of open source databases by metrics including the number of stars, pull requests, pull request creators, and issues. 

![Top 10 open source databases by stars](/img/screenshots/line-chart.png)

<center><em>Top 10 open source databases by stars</em></center>

<br />
<br />

### Analyze any single repository 
OSS Insight allows you to explore in depth any single repository in real time. By entering any repository or selecting from the option lists at the [search box](https://ossinsight.io/), you can get an in-depth and comprehensive analysis of this repository, including an overview of its number of stars, commits, issues, and a few other metrics. 

![An overview of the TiDB repository](/img/screenshots/overview-of-tidb-repo.png)

<center><em>An overview of the TiDB repository</em></center>

<br />

In addition to an overview of a repository, we also provide another four analytical dimensions: **People, Commits, Pull Requests, and Issues**. By analyzing a repository using the four metrics, you can get a full picture of a repository and draw your own conclusions on many aspects including its popularity among various developers and industries, coding vitality, and coding efficiency. 

### Compare any two repositories
If you want to compare two repositories, you can enter the two repositories or select from the option lists at the two [search boxes](https://ossinsight.io/) respectively. Then, you will get a comparative analytical result of the two repositories, including their repository overview, and in-depth analysis about their pull requests, issues, commits, contributors, stargazers and other metrics.  

![Compare TiDB with any other repository by entering its name at the search box](/img/screenshots/analyze_selector.png)

<center><em>Compare TiDB with any other repository by entering its name at the search box</em></center>

<br />
<br />

## Welcome to join this project! 
If you like our project or are interested to join us, feel free to [submit your PRs](https://github.com/pingcap/ossinsight) to our GitHub repository. You can also try to analyze your own datasets by using TiDB Cloud with [this 10-minute tutorial](https://ossinsight.io/blog/try-it-yourself/). 

## Contact us! 
You can also follow us on [Twitter](https://twitter.com/OSSInsight) for the latest information. 
If you have wonderful ideas to share with us, or want to cooperate with us, you can share your ideas via our [Twitter](https://twitter.com/OSSInsight) or email us at [ossinsight@pingcap.com](mailto:ossinsight@pingcap.com). 
