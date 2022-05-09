<h1 align="center"> About OSS Insight</h1>

OSS Insight -> Open Source Software Insight


Recently, we launched OSS Insight - our powerful and interesting insight tool built with [Docusaurus](https://github.com/facebook/docusaurus), [Apache ECharts](https://echarts.apache.org/), [GH Archive](https://www.gharchive.org/), [GHTorrent](https://ghtorrent.org/) and [TiDB](https://github.com/pingcap/tidb). 

![homepage](/img/screenshots/homepage.png)

As a group of people working in the open source community, we often work with GitHub data. We focus on the health of open source projects and all the new things happening in the open source world. Therefore, we decided to establish this site by using **4.6 billion GitHub event data** in order to gain useful insights through a/pair/group of open source projects in multi-dimensional. We hope to make the open source ecosystem better with you.

We're honored to have brought this project to the attention of everyone after its release, some interesting responses and shares have started to circulate (see our [Twitter](https://twitter.com/OSSInsight) for details), and we're excited to see more people use this powerful tool to discover insights. If it can also help you deal with problems(such as dealing with dataset as large as 4.6 billion data from GitHub), that would be a bonus!

In this project, we mainly provide two major functions, one is the analysis results of specific fields, and the other one is a custom analysis tool for GitHub repositories.

## Analysis in Specific Technical Areas

We provide analysis results from [six specific technical areas](https://ossinsight.io/database/deep-insight-into-open-source-databases/) that are popular in open source software. You can explore the trends in different tech-fields and find which repositories are the most popular, which repositories have the most Pull Requests/Issues, etc. And more importantly, we also offer you [real-time insights](https://ossinsight.io/database/realtime/) for your reference.

:::note

📌 Due to the limitation of raw dataset from GitHub, we currently provide real-time insights in one hour. But we are happy to share with you that **minute-level insights** are already on the way!

:::

![homepage insight](/img/screenshots/homepage_insight.png)

## Powerful Custom Analysis Tool

A visual, comprehensive tool can be very helpful when analyzing the repositories you are interested in.

You can simply enter/select any repository at the [search bar](https://ossinsight.io/) and it will lead you to the detailed analysis page as well as experience it at the navigation bar wherever you are on the subpar. In addition to the overview, we will also analyze the repositories from the four dimensions of Commits, Pull Requests, Issues, and People. Here you can see many dynamic and interesting charts, showing the performance of the repository. Of course, we are not just providing static chart images, thanks to [Apache ECharts](https://echarts.apache.org/), our charts are interactive and update in real-time. 

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
