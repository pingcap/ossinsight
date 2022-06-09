<h1 align="center"> About OSS Insight</h1>

OSS Insight -> Open Source Software Insight


Recently, we launched OSS Insight - our powerful and interesting insight tool built with [Docusaurus](https://github.com/facebook/docusaurus), [Apache ECharts](https://echarts.apache.org/), [GH Archive](https://www.gharchive.org/), [GHTorrent](https://ghtorrent.org/) and [TiDB](https://github.com/pingcap/tidb). 

![homepage](/img/screenshots/homepage.png)

As a group of people working in the open source community, we often work with GitHub data. We focus on the health of open source projects and all the new things happening in the open source world. Therefore, we decided to establish this site by using **4.6 billion GitHub event data** in order to gain useful insights through a/pair/group of open source projects in multi-dimensional. We hope to make the open source ecosystem better with you.

We're honored to have brought this project to the attention of everyone after its release, some interesting responses and shares have started to circulate (see our [Twitter](https://twitter.com/OSSInsight) for details), and we're excited to see more people use this powerful tool to discover insights. If it can also help you deal with problems(such as dealing with dataset as large as 4.6 billion data from GitHub), that would be a bonus!

In this project, we mainly provide two major functions, one is **the monthly rankings/historical trends** for GitHub collections and the other one is **a custom analysis tool** for Github repositories.

## Monthly Rankings/Historical Trends for GitHub Collections

You can view the monthly ranking and historical trends of a repository by clicking the **[Collections](https://ossinsight.io/collections/open-source-database)** button on the navigation bar. We calculate the monthly incremental data of the repository by using the raw data from [GitHub Collections](https://github.com/collections). The rankings(include stars, pull requests, and issues ranking) is considered with the monthly increment for each repository.

:::note

### 📌 How to add collections
We welcome your contributions here! You can add a collection on our website by **[submitting PRs here](https://github.com/pingcap/ossinsight)**. 

:::

We always keep working on how to make our OSS Insight more interesting and useful, so we chose some cool dynamic charts to display powerful insights. 

The **bar chart race** can simulate the historical growth situation of repositories, not only the growth process for total amount, but also the ranking relationship between different repositories. For example, in the [open source database - stars](https://ossinsight.io/collections/open-source-database/trends/) shown here, we can see that the stars for [pingcap/tidb](https://github.com/pingcap/ossinsight) growth very rapidly, and the ranking has been reached to the second place very fast after it was created, and it continues to move forward.

![Bar Chart Race](/img/screenshots/bar-chart-race.png)

If you just wondering the annual ranking changes of a repository, we recommend you use the **pipeline chart** to gain insights with the concise and clear annual ranking results.

![Pipeline Chart](/img/screenshots/pipeline-chart.png)

We also used a **line chart** to show the Historical Trending of Top 10 repositories in a collection. You can see more granular ranking trends month to month here.

![line Chart](/img/screenshots/line-chart.png)

## Powerful Custom Analysis Tool

A visual, comprehensive tool can be very helpful when analyzing the repositories you are interested in.

You can simply enter/select any repository at the [search bar](https://ossinsight.io/) and it will lead you to the detailed analysis page as well as experience it at the navigation bar wherever you are on the subpar. In addition to the overview, we will also analyze the repositories from the four dimensions of Commits, Pull Requests, Issues, and People. Here you can see many dynamic and interesting charts, showing the performance of the repository. Of course, we are not just providing static chart images, thanks to [Apache ECharts](https://echarts.apache.org/), our charts are interactive and update in **real-time**. 

![analyze selector](/img/screenshots/analyze_selector.png)

*\* Analyze any 1/2 repositories with selectors*

If you want to compare your own repository with others, just enter/select another repository's name in the selector which fixed on the top of analyze page. Then you will instantly get a comparative insight result, which can become a unique comparative analysis report after a simple processing. 

We recommend you try our **Geographical Distribution** and **Companies** sections on the [analysis page](https://ossinsight.io/analyze/pingcap/tidb). Here, we process personal public information from GitHub and display it with visual charts. You can see which companies are contributing to the projects most, and you can also see how popular it is worldwide.

![user list](/img/screenshots/user_list.png)

*\* Personal public information from GitHub*

<table>
    <tr style={{ border:"none" }}>
        <td style={{ border:"none" }}>
            <img src="/img/screenshots/geo_locations.png" alt="Geographical Distribution"/>
        </td>
        <td style={{ border:"none" }}>
            <img src="/img/screenshots/companies.png" alt="Companies"/>
        </td>
    </tr>
</table>

*\* Geographical Distribution and Companies sections on the analysis page*

If you need other detailed cases to start your journey, you can refer to our blog to find out how we built this website and processed such a huge dataset. Of course, we also encourage you to [play around](https://ossinsight.io/try-your-own-dataset) with your own dataset and build cool projects. If you have a good idea, please share it with us via [Twitter](https://twitter.com/OSSInsight).

## Contributions Welcome!

If you liked our project or you are a developer who is interested in contributing with us, please feel free to raise a PR [here](https://github.com/pingcap/ossinsight).

Feel free to reach out to us on our [Twitter](https://twitter.com/OSSInsight) for any queries.

:::info

### Contact us via email

ossinsight@pingcap.com

:::
