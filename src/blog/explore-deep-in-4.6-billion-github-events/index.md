---
title: Explore Deep in 4.6 Billion GitHub Events
date: 2022-05-03
authors: [fendy]
tags: [tidbcloud]
image: ./banner-ossinsight-explore-deep.jpg
description: Here you can find the answer of what does a view of 4.6 billion Github events really look like and what secrets and values can be discovered in such an enormous amount of data. 
keywords: [Popularity repositories, distribution of stargazer, tidb, top rankings, github, database, github archive, gitHub metrics, compare oss]
---

4.6 billion is literally an astronomical figure. The richest star map of our galaxy, brought by Gaia space observatory, includes just under 2 billion stars. What does a view of 4.6 billion GitHub events really look like? What secrets and values can be discovered in such an enormous amount of data? 

Here you go: [OSSInsight.io](https://ossinsight.io/)** can help you find the answer**. It’s a useful insight tool that can give you the most updated open source intelligence, and help you deeply understand any single GitHub project or quickly compare any two projects by digging deep into 4.6 billion GitHub events in real time. Here are some ways you can play with it.

## Compare any two GitHub projects

Do you wonder how different projects have performed and developed over time? Which project is worthy of more attention? **[OSSInsight.io](https://ossinsight.io/)** can answer your questions via the [Compare Projects](https://ossinsight.io/analyze/pingcap/tidb) page.

Let’s take the [Kubernetes repository](https://github.com/kubernetes/kubernetes)  (K8s) and Docker’s [Moby repository](https://github.com/moby/moby) as examples and compare them in terms of popularity and coding vitality. 


### **Popularity**

To compare the popularity of two repositories, we use multiple metrics including the number of stars, the growth trend of stars over time, and stargazers’ geographic and employment distribution. 

#### **Number of stars**

The line chart below shows the accumulated number of stars of K8s and Moby each year. According to the chart, Moby was ahead of K8s until late 2019. The star growth of Moby slowed after 2017 while K8s has kept a steady growth pace. 

![](./the-star-history.png)

<center><em>The star history of K8s and Moby</em></center>


#### **Geographical distribution of stargazers**

The map below shows the stargazers’ geographical distribution of Moby and K8s. As you can see, their stargazers are scattered around the world with the majority coming from the US, Europe, and China.

![](./geographicla-distribution-of-stargazers.png)


<center><em>The geographical distribution of K8s and Moby stargazers</em></center>

#### **Employment distribution of stargazers**

The chart below shows the stargazers’ employment of K8s (red) and Moby (dark blue). Both of their stargazers work in a wide range of industries, and most come from leading dotcom companies such as Google, Tencent, and Microsoft. The difference is that the top two companies of K8s’ stargazers are  Google and Microsoft from the US, while Moby’s top two followers are Tencent and Alibaba from China.  

![](./employment-distribution-of-stargazers.png)


<center><em>The employment distribution of K8s and Moby stargazers</em></center>

<!--truncate-->

### **Coding vitality**

To compare the coding vitality of two GitHub projects, we use many metrics including the growth trend of pull requests (PRs), the monthly number of PRs, commits and pushes, and the heat map of developers’ contribution time.  

#### **Number of commits and pushes**

The bar chart below shows the number of commits and pushes submitted to K8s (top) and Moby (bottom) each month after their inception. Generally speaking, K8s has more pushes and commits than Moby, and their number grew stably until 2020 followed by a slowdown afterwards. Moby’s monthly pushes and commits had a minor growth between 2015 and 2017, and then barely increased after 2018.

![](./monthly-pushes-and-commits.png)

<center><em>The monthly pushes and commits of K8s (top) and Moby (bottom)</em></center>

#### **Number of PRs**

The charts below show the monthly and accumulated number of PRs of the two repositories. As you can see, K8s has received stable and consistent PR contributions ever since its inception and its accumulated number of PRs has also grown steadily. Moby had vibrant PR submissions before late 2017, but started to drop afterwards. Its accumulated number of PRs reached a plateau in 2017, which has remained the case ever since. 

![](./monthly-and-accumulated-pr-number.png)


<center><em>The monthly and accumulated PR number of K8s (top) and Moby (bottom)</em></center>

#### **Developers’ contribution time**

The following heat map shows developers’ contribution time for K8s (left) and Moby (right). Each square represents one hour in a day. The darker the color, the more contributions occur during that time. K8s has many more dark parts than Moby, and K8s’ contributions occur almost 24 hours a day, 7 days a week. K8s definitely has more dynamic coding activities than Moby. 

![](./heat-map.png)


<center><em>Heat map of developers’ contribution time of K8s (left) and Moby (right)</em></center>

<br />

**Taken together**, these metrics show that while both K8s and Moby are popular across industries world-wide, K8s has more vibrant coding activities than Moby. K8s is continuously gaining popularity and coding vitality while Moby is falling in both over time.

Popularity and coding vitality are just two dimensions to compare repositories. If you want to discover more insights or compare other projects you are interested in, feel free to visit the [Compare](https://ossinsight.io/analyze/pingcap/tidb) page and explore it for yourself.  

Of course, you can use this same page to **deeply explore any single GitHub project** and gain the most up-to-date insights about them. The key metrics and the corresponding changes are presented in a panoramic view. More in-depth analytics such as code changes by PR size groups and PR lines are also available. Explore it for yourself and you’d be surprised. Have fun. 

![](./panoramic-view-of-key-github-metrics.png)

<center><em>Panoramic view of key GitHub metrics (K8s as an example)</em></center>

<br />

![](./total-pr-number-each-month-and-pr-groups.png)

<center><em>  Total PR number each month/PR groups (K8s as an example)</em></center>

<br />

![](./number-of-lines-of-code-change-each-month.png)

<center><em>The number of lines of code change each month (K8s as an example)</em></center>


## Key open source insights

[OSSInsight.io](https://ossinsight.io/) does more than explore or compare repositories. **It gives you [historical, real-time, and custom open source insights](https://ossinsight.io/database/deep-insight-into-open-source-databases).** In this section, we’ll share some key insights in open source databases and programming languages. If you want to gain insights in other areas, you can explore the [Insights](https://ossinsight.io/database/deep-insight-into-open-source-databases/)  page for yourself. 

**Note**: If you want to get those analytical results by yourself, you can execute the SQL commands above each chart on TiDB Cloud with ease following this [10-minute tutorial](https://ossinsight.io/blog/try-it-yourself/). 


### **Rust: the most active programming language**

Rust was first released in 2012 and has been among the leading programming languages for 10 years. It has the most active repository with a total of 103,047 PRs at the time of writing. 

<details><summary>Click here to show SQL commands</summary>
<p>

```sql
SELECT
    programming_language_repos.name AS repo_name,
    COUNT(*)      AS num
FROM github_events
         JOIN programming_language_repos ON programming_language_repos.id = github_events.repo_id
WHERE type = 'PullRequestEvent'
  AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10
```

</p>
</details>

![](./pr-number-of-pl-repos.png)


<center><em>PR numbers of the leading programming languages</em></center>

### **Go: the new favorite and the fastest growing programming language**

According to **[OSSInsight.io](https://ossinsight.io/)**, 10 programming languages dominate the open source community. Go is the most popular with 108,317 stars, followed by Node and TypeScript. Go is also the fastest growing language in popularity.

<details><summary>Click here to show SQL commands</summary>
<p>

```sql
WITH repo_stars AS (
    SELECT
        repo_id,
        ANY_VALUE(repos.name) AS repo_name,
        COUNT(distinct actor_login) AS stars
    FROM github_events
         JOIN programming_language_repos repos ON repos.id = github_events.repo_id
    WHERE type = 'WatchEvent'
    GROUP BY 1
), top_10_repos AS (
    SELECT
        repo_id, repo_name, stars
    FROM repo_stars rs
    ORDER BY stars DESC
    LIMIT 10
), tmp AS (
    SELECT
        event_year,
        tr.repo_name AS repo_name,
        COUNT(*) AS year_stars
    FROM github_events
         JOIN top_10_repos tr ON tr.repo_id = github_events.repo_id
    WHERE type = 'WatchEvent' AND event_year <= 2021
    GROUP BY 2, 1
    ORDER BY 1 ASC, 2
), tmp1 AS (
    SELECT
        event_year,
        repo_name,
        SUM(year_stars) OVER(partition by repo_name order by event_year ASC) as stars
    FROM tmp
    ORDER BY event_year ASC, repo_name
)
SELECT event_year, repo_name, stars FROM tmp1
```

</p>
</details>

![](./star-growth-trends-of-leading-programming-languages.png)

<center><em>The star growth trends of leading programming languages</em></center>


### **Microsoft and Google: the top two programing languages contributors**

As world-renowned high-tech companies, Microsoft and Google take the lead in open source language contributions with a total of 1,443 and 947 contributors respectively at the time of writing. 

<details><summary>Click here to show SQL commands</summary>
<p>

```sql
SELECT
    TRIM(LOWER(REPLACE(u.company, '@', ''))) AS company,
    COUNT(DISTINCT actor_id)                 AS num
FROM
    github_events github_events
    JOIN programming_language_repos db ON db.id = github_events.repo_id
    JOIN users u ON u.login = github_events.actor_login
WHERE
    github_events.type IN (
        'IssuesEvent', 'PullRequestEvent','IssueCommentEvent',
        'PullRequestReviewCommentEvent', 'CommitCommentEvent',
        'PullRequestReviewEvent'
    )
    AND u.company IS NOT NULL
    AND u.company != ''
    AND u.company != 'none'
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20;
```

</p>
</details>

![](./companies-who-contribute-the-most-to-programing-languages.png)


<center><em>Companies who contribute the most to programing languages</em></center>


### **Elasticsearch draws the most attention**

Elasticsearch was one of the first open source databases. It is the most liked database with 64,554 stars, followed by Redis and Prometheus. From 2011 to 2016, Elasticseasrch and Redis shared the top spot until Elasticsearch broke away in 2017.

<details><summary>Click here to show SQL commands</summary>
<p>

```sql
WITH repo_stars AS (
    SELECT
        repo_id,
        ANY_VALUE(repos.name) AS repo_name,
        COUNT(distinct actor_login) AS stars
    FROM github_events
         JOIN db_repos repos ON repos.id = github_events.repo_id
    WHERE type = 'WatchEvent'
    GROUP BY 1
), top_10_repos AS (
    SELECT
        repo_id, repo_name, stars
    FROM repo_stars rs
    ORDER BY stars DESC
    LIMIT 10
), tmp AS (
    SELECT
        event_year,
        tr.repo_name AS repo_name,
        COUNT(*) AS year_stars
    FROM github_events
         JOIN top_10_repos tr ON tr.repo_id = github_events.repo_id
    WHERE type = 'WatchEvent' AND event_year <= 2021
    GROUP BY 2, 1
    ORDER BY 1 ASC, 2
), tmp1 AS (
    SELECT
        event_year,
        repo_name,
        SUM(year_stars) OVER(partition by repo_name order by event_year ASC) as stars
    FROM tmp
    ORDER BY event_year ASC, repo_name
)
SELECT event_year, repo_name, stars FROM tmp1
```

</p>
</details>


![](./star-growth-trend-of-leading-databases.png)


<center><em>The star growth trend of leading databases</em></center>


### **China: the number one fan of open source databases**

China has the most open source database followers with 11,171 stargazers of database repositories, followed by the US and Europe. 

<details><summary>Click here to show SQL commands</summary>
<p>

```sql
select upper(u.country_code) as country_or_area, count(*) as count, count(*) / max(s.total) as percentage
from github_events
use index(index_github_events_on_repo_id)
left join users u ON github_events.actor_login = u.login
join (
    -- Get the number of people has the country code.
    select count(*) as total
    from github_events
    use index(index_github_events_on_repo_id)
    left join users u ON github_events.actor_login = u.login
    where repo_id in (507775, 60246359, 17165658, 41986369, 16563587, 6838921, 108110, 166515022, 48833910, 156018, 50229487, 20089857, 5349565, 6934395, 6358188, 11008207, 19961085, 206444, 30753733, 105944401, 31006158, 99919302, 50874442, 84240850, 28738447, 44781140, 372536760, 13124802, 146459443, 28449431, 23418517, 206417, 9342529, 19257422, 196353673, 172104891, 402945349, 11225014, 2649214, 41349039, 114187903, 20587599, 19816070, 69400326, 927442, 24494032) and github_events.type = 'WatchEvent' and u.country_code is not null
) s
where repo_id in (507775, 60246359, 17165658, 41986369, 16563587, 6838921, 108110, 166515022, 48833910, 156018, 50229487, 20089857, 5349565, 6934395, 6358188, 11008207, 19961085, 206444, 30753733, 105944401, 31006158, 99919302, 50874442, 84240850, 28738447, 44781140, 372536760, 13124802, 146459443, 28449431, 23418517, 206417, 9342529, 19257422, 196353673, 172104891, 402945349, 11225014, 2649214, 41349039, 114187903, 20587599, 19816070, 69400326, 927442, 24494032) and github_events.type = 'WatchEvent' and u.country_code is not null
group by 1
order by 2 desc;
```

</p>
</details>

![](./geographical-distribution-database-stargazers.png)


<center><em>The geographical distribution of open source database stargazers</em></center>


**[OSSInsight.io](https://ossinsight.io/)** also allows you to create your own custom insights into any GitHub repository created after 2011. You’re welcome to visit the [Insights page](https://ossinsight.io/database/deep-insight-into-open-source-databases) to explore more. 


## Run your own analytics with TiDB Cloud

All the analytics on **[OSSInsight.io](https://ossinsight.io/)** are powered by [TiDB Cloud](https://www.pingcap.com/tidb-serverless/), a fully-managed database as a service. If you want to run your own analytics and get your own insights, [sign up for a TiDB Cloud account](https://tidbcloud.com/free-trial/?utm_source=ossinsight&utm_medium=community) and try it for yourself with this [10-minute tutorial](https://ossinsight.io/blog/try-it-yourself/).

## Contact us 

Do you find **[OSSInsight.io](https://ossinsight.io/)** useful and fun to work with? Do you have any question or feedback to share with us? Feel free to [file an issue](https://github.com/pingcap/ossinsight/issues/new) on GitHub or follow us on [Twitter](https://twitter.com/OSSInsight/) to get the latest information. You’re also welcome to share this insight tool with your friends. 

