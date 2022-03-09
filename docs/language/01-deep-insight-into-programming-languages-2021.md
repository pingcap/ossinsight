---
title: "Deep Insight Into Programming Languages: 2021"
image: /img/language.png
---

![](/img/language.png)


## Stars histories of top OSS programming language repos since 2011

<iframe  width="100%" height="400" scrolling="no"  src="/charts/language_repo.html?theme=dark">
</iframe>

## Trends in the number of PR events in various programming languages since 2011
<iframe  width="100%" height="400" scrolling="no"  src="/charts/language.html?theme=dark">
</iframe>

## Top 10 repos by stars in 2021

<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT jf.name as repo_name, count(*) as stars
    FROM github_events
         JOIN programming_language_repos jf ON jf.id = github_events.repo_id
   WHERE event_year = 2021 
         AND type = 'WatchEvent' 
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```
</details>

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22golang/go%22,%22rust-lang/rust%22,%22Microsoft/TypeScript%22,%22nodejs/node%22,%22PowerShell/PowerShell%22,%22JuliaLang/julia%22,%22python/cpython%22,%22JetBrains/kotlin%22,%22vlang/v%22,%22openjdk/jdk%22]&data=[14968,12258,10593,10234,8938,7594,7486,6350,6208,4875]&label=Star&theme=vintage">
</iframe>

## Top 10 repos by PR in 2021

<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT wf.name AS repo_name,
         COUNT(*) AS num
    FROM github_events 
         JOIN web_framework_repos wf ON wf.id = github_events.repo_id
   WHERE type = 'PullRequestEvent' AND event_year = 2021 AND action = 'opened'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```
</details>

<iframe  width="100%" height="350" scrolling="no"  src="/charts/bar.html?x=[%22rust-lang/rust%22,%22python/cpython%22,%22apple/swift%22,%22dotnet/roslyn%22,%22openjdk/jdk%22,%22vlang/v%22,%22nodejs/node%22,%22JuliaLang/julia%22,%22nim-lang/Nim%22,%22ziglang/zig%22]&data=[6328,5393,4905,4450,4386,2658,2498,2352,1657,1371]&label=PR&theme=vintage">
</iframe>

## Top 10 repos by contributors in 2021

<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT wf.name AS repo_name, 
         count(distinct actor_id) AS count
    FROM github_events
    JOIN programming_language_repos wf ON wf.id = github_events.repo_id
   WHERE type in (
            'IssuesEvent', 
            'PullRequestEvent', 
            'IssueCommentEvent', 
            'PullRequestReviewCommentEvent', 
            'CommitCommentEvent', 
            'PullRequestReviewEvent'
          ) and event_year = 2021 
 GROUP BY 1
 ORDER BY 2 DESC
    LIMIT 10
```
</details>

```
+-----------------------+-------+
| repo_name             | count |
+-----------------------+-------+
| Microsoft/TypeScript  | 4556  |
| golang/go             | 4492  |
| rust-lang/rust        | 3650  |
| nodejs/node           | 2396  |
| dart-lang/sdk         | 1567  |
| dotnet/roslyn         | 1438  |
| PowerShell/PowerShell | 1320  |
| python/cpython        | 1229  |
| JuliaLang/julia       | 1193  |
| ziglang/zig           | 943   |
+-----------------------+-------+
```

## Top Developers for OSS programming languages

<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT actor_login, count(*) as pr_count
    FROM github_events
         JOIN programming_language_repos wf ON wf.id = github_events.repo_id
   WHERE event_year = 2021 
         AND type = 'PullRequestEvent' 
         AND action = 'opened' 
         AND actor_login not like '%bot%'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 20
```
</details>

```
+-----------------+----------+
| actor_login     | pr_count |
+-----------------+----------+
| miss-islington  | 1586     |
| yuyi98          | 564      |
| timotheecour    | 418      |
| Trott           | 399      |
| CyrusNajmabadi  | 384      |
| pancakevirus    | 366      |
| xflywind        | 365      |
| DougGregor      | 357      |
| GuillaumeGomez  | 324      |
| WalterBright    | 316      |
| slavapestov     | 294      |
| MarcusDenker    | 283      |
| astares         | 267      |
| ibuclaw         | 265      |
| Youssef1313     | 256      |
| pablogsal       | 252      |
| JohnTitor       | 252      |
| straight-shoota | 243      |
| vstinner        | 243      |
| erlend-aasland  | 229      |
+-----------------+----------+
```

## OSS programming language repos with the highest growth YoY

<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT wf.name,
         sum(event_year = 2020) AS stars2020,
         sum(event_year = 2021) AS stars2021,
         round(sum(event_year = 2021) / sum(event_year = 2020), 3) AS yoy
    FROM github_events
         JOIN programming_language_repos as wf on wf.id = github_events.repo_id
   WHERE type = 'WatchEvent' AND event_year in (2021, 2020)
GROUP BY wf.name
  HAVING stars2020 > 0 and yoy > 1
ORDER BY yoy DESC
   LIMIT 20
```
</details>

```
+-----------------------+-----------+-----------+-------+
| name                  | stars2020 | stars2021 | yoy   |
+-----------------------+-----------+-----------+-------+
| crystal-lang/crystal  | 1561      | 2039      | 1.306 |
| ziglang/zig           | 3433      | 4483      | 1.306 |
| JetBrains/kotlin      | 5323      | 6350      | 1.193 |
| dotnet/csharplang     | 1576      | 1808      | 1.147 |
| PowerShell/PowerShell | 7826      | 8938      | 1.142 |
| php/php-src           | 3761      | 4279      | 1.138 |
| rust-lang/rust        | 10901     | 12258     | 1.124 |
| terralang/terra       | 194       | 217       | 1.119 |
| Frege/frege           | 154       | 158       | 1.026 |
+-----------------------+-----------+-----------+-------+

```

## OSS programming language repos with lowest growth YoY

<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT wf.name,
         sum(event_year = 2020) AS stars2020,
         sum(event_year = 2021) AS stars2021,
         round(sum(event_year = 2021) / sum(event_year = 2020), 3) AS yoy
    FROM github_events
         JOIN programming_language_repos as wf on wf.id = github_events.repo_id
   WHERE type = 'WatchEvent' AND event_year in (2021, 2020)
GROUP BY wf.name
  HAVING stars2020 > 100 and yoy < 1
ORDER BY yoy ASC
   LIMIT 10
```
</details>

```
+----------------------+-----------+-----------+-------+
| name                 | stars2020 | stars2021 | yoy   |
+----------------------+-----------+-----------+-------+
| beefytech/Beef       | 1790      | 266       | 0.149 |
| idris-lang/Idris-dev | 263       | 108       | 0.411 |
| typelead/eta         | 151       | 93        | 0.616 |
| programming-nu/nu    | 49        | 32        | 0.653 |
| rakudo/rakudo        | 198       | 136       | 0.687 |
| scala/scala          | 1025      | 723       | 0.705 |
| coq/coq              | 715       | 511       | 0.715 |
| gkz/LiveScript       | 105       | 76        | 0.724 |
| elm/compiler         | 731       | 530       | 0.725 |
| lucee/Lucee          | 124       | 91        | 0.734 |
+----------------------+-----------+-----------+-------+
```

## Top companies  contributing to OSS programming languages

<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT trim(lower(replace(u.company, '@', ''))) AS company, 
         count(distinct actor_id) AS users_count
    FROM github_events
         JOIN programming_language_repos wf ON wf.id = github_events.repo_id
         JOIN users u ON u.login = github_events.actor_login 
   WHERE event_year = 2021 
         AND github_events.type IN (
           'IssuesEvent', 
           'PullRequestEvent', 
           'IssueCommentEvent', 
           'PullRequestReviewCommentEvent', 
           'CommitCommentEvent', 
           'PullRequestReviewEvent'
         )
         AND u.company IS NOT NULL 
         AND u.company != '' 
         AND u.company != 'none'
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 20
```
</details>

```
+------------+-------------+
| company    | users_count |
+------------+-------------+
| microsoft  | 420         |
| google     | 294         |
| jetbrains  | 74          |
| oracle     | 68          |
| red hat    | 60          |
| facebook   | 47          |
| apple      | 38          |
| mozilla    | 35          |
| ibm        | 32          |
| tencent    | 31          |
| shopify    | 23          |
| bytedance  | 23          |
| inria      | 22          |
| freelancer | 20          |
| vmware     | 18          |
| sap        | 18          |
| alibaba    | 18          |
| freelance  | 18          |
| datadog    | 16          |
| elastic    | 16          |
+------------+-------------+
```

## Top countries or regions contributing to OSS programming languages

<details>
 <summary>Click here to expand SQL</summary>

```sql
  SELECT country_code, 
         count(distinct actor_id) AS users_count
    FROM github_events
         JOIN programming_language_repos wf ON wf.id = github_events.repo_id
         JOIN users u ON u.login = github_events.actor_login 
   WHERE event_year = 2021 
         AND github_events.type IN (
           'IssuesEvent', 
           'PullRequestEvent', 
           'IssueCommentEvent', 
           'PullRequestReviewCommentEvent', 
           'CommitCommentEvent', 
           'PullRequestReviewEvent'
         )
         AND country_code is not null
GROUP BY 1
ORDER BY 2 DESC
   LIMIT 10
```
</details>

```
+--------------+-------------+
| country_code | users_count |
+--------------+-------------+
| US           | 3921        |
| DE           | 1168        |
| GB           | 939         |
| CN           | 854         |
| FR           | 623         |
| CA           | 536         |
| RU           | 509         |
| IN           | 421         |
| AU           | 397         |
| BR           | 356         |
+--------------+-------------+
```

## OSS programming language ranking

The previous analysis is for a single dimension. Let’s analyze the comprehensive measurement. The open source programming language community is comprehensively scored through the three metrics: stars, PRs and contributors. We can use the [Z-score](https://en.wikipedia.org/wiki/Standard_score) method to score the repo.
<details>
 <summary>Click here to expand SQL</summary>

```sql
WITH stars AS (
    SELECT /*+ read_from_storage(tiflash[github_events]) */ 
        wf.name AS repo_name, 
        COUNT(*) AS count
    FROM github_events
    JOIN programming_language_repos wf ON wf.id = github_events.repo_id
    WHERE type = 'WatchEvent' and event_year = 2021
    GROUP BY 1 
),

prs as (
    SELECT /*+ read_from_storage(tiflash[github_events]) */ 
      wf.name AS repo_name, 
      COUNT(*) AS count
    FROM github_events
    JOIN programming_language_repos wf ON wf.id = github_events.repo_id
    WHERE type = 'PullRequestEvent' and event_year = 2021 and action = 'opened'
    GROUP BY 1 
),

contributors AS (
    SELECT /*+ read_from_storage(tiflash[github_events]) */ 
      wf.name AS repo_name, 
      count(distinct actor_id) AS count
    FROM github_events
    JOIN programming_language_repos wf ON wf.id = github_events.repo_id
    WHERE type in (
        'IssuesEvent', 
        'PullRequestEvent', 
        'IssueCommentEvent', 
        'PullRequestReviewCommentEvent', 
        'CommitCommentEvent', 
        'PullRequestReviewEvent') and event_year = 2021 
    GROUP BY 1 
),

raw as (
    SELECT 
        name, 
        stars.count AS star_count, 
        COALESCE(prs.count, 0) AS pr_count,
        contributors.count as user_count
    FROM programming_language_repos 
    LEFT JOIN stars ON stars.repo_name = name
    LEFT JOIN prs ON prs.repo_name = name
    LEFT JOIN contributors ON contributors.repo_name = name
),

zz_pr as (
    SELECT AVG(pr_count) AS mean, STDDEV(pr_count) AS sd FROM raw
),

zz_star as (
    SELECT AVG(star_count) AS mean, STDDEV(star_count) AS sd FROM raw
),

zz_user as (
    SELECT AVG(user_count) AS mean, STDDEV(user_count) AS sd FROM raw
)

SELECT name, 
      round(((star_count - zz_star.mean) / zz_star.sd) +
      ((user_count - zz_user.mean) / zz_user.sd) +
      ((pr_count - zz_pr.mean) / zz_pr.sd), 2) AS z_score,
      round((star_count - zz_star.mean) / zz_star.sd, 2) AS z_score_star,
      round((user_count - zz_user.mean) / zz_user.sd, 2) AS z_score_user,
      round((pr_count - zz_pr.mean) / zz_pr.sd, 2) AS z_score_pr
FROM raw, 
    zz_star,
    zz_user,
    zz_pr
ORDER BY 2 DESC
```
</details>

This is the comprehensive ranking calculated by z-score:
```
+-------------------------------+---------+--------------+--------------+------------+
| name                          | z_score | z_score_star | z_score_user | z_score_pr |
+-------------------------------+---------+--------------+--------------+------------+
| rust-lang/rust                |  9.8    |  2.9         |  3.15        |  3.74      |
| golang/go                     |  7.47   |  3.69        |  4.0         | -0.22      |
| Microsoft/TypeScript          |  6.68   |  2.42        |  4.07        |  0.19      |
| python/cpython                |  5.32   |  1.51        |  0.71        |  3.1       |
| nodejs/node                   |  5.29   |  2.31        |  1.89        |  1.1       |
| apple/swift                   |  3.29   |  0.69        | -0.16        |  2.76      |
| dotnet/roslyn                 |  3.21   | -0.15        |  0.92        |  2.45      |
| JuliaLang/julia               |  3.21   |  1.55        |  0.67        |  1.0       |
| openjdk/jdk                   |  3.15   |  0.76        | -0.01        |  2.4       |
| vlang/v                       |  2.49   |  1.14        |  0.15        |  1.21      |
| PowerShell/PowerShell         |  2.47   |  1.94        |  0.8         | -0.26      |
| ziglang/zig                   |  1.38   |  0.64        |  0.42        |  0.32      |
| JetBrains/kotlin              |  0.7    |  1.18        | -0.28        | -0.2       |
| php/php-src                   |  0.69   |  0.58        | -0.04        |  0.14      |
| nim-lang/Nim                  |  0.32   | -0.1         | -0.09        |  0.52      |
| dart-lang/sdk                 |  0.27   | -0.23        |  1.05        | -0.55      |
| micropython/micropython       | -0.08   | -0.07        |  0.15        | -0.15      |
| crystal-lang/crystal          | -0.37   | -0.07        | -0.2         | -0.1       |
| ruby/ruby                     | -0.38   | -0.26        | -0.31        |  0.19      |
| elixir-lang/elixir            | -0.47   | -0.09        | -0.14        | -0.24      |
| dotnet/fsharp                 | -0.67   | -0.52        | -0.2         |  0.04      |
| erlang/otp                    | -0.68   | -0.41        | -0.13        | -0.14      |
| dotnet/csharplang             | -0.69   | -0.14        | -0.02        | -0.53      |
| AssemblyScript/assemblyscript | -0.75   |  0.1         | -0.38        | -0.46      |
| dlang/dmd                     | -0.8    | -0.6         | -0.42        |  0.22      |
| chapel-lang/chapel            | -0.81   | -0.59        | -0.42        |  0.2       |
| pharo-project/pharo           | -0.84   | -0.6         | -0.38        |  0.15      |
| coq/coq                       | -0.85   | -0.51        | -0.35        |  0.01      |
| ocaml/ocaml                   | -1.1    | -0.5         | -0.28        | -0.31      |
| scala/scala                   | -1.22   | -0.45        | -0.43        | -0.34      |
| cue-lang/cue                  | -1.32   | -0.28        | -0.42        | -0.62      |
| racket/racket                 | -1.32   | -0.52        | -0.33        | -0.47      |
| HaxeFoundation/haxe           | -1.34   | -0.44        | -0.35        | -0.56      |
| purescript/purescript         | -1.42   | -0.45        | -0.43        | -0.54      |
| ring-lang/ring                | -1.47   | -0.6         | -0.52        | -0.35      |
| rakudo/rakudo                 | -1.5    | -0.62        | -0.41        | -0.47      |
| ponylang/ponyc                | -1.54   | -0.53        | -0.48        | -0.52      |
| lucee/Lucee                   | -1.55   | -0.63        | -0.51        | -0.41      |
| elm/compiler                  | -1.57   | -0.51        | -0.44        | -0.62      |
| beefytech/Beef                | -1.62   | -0.58        | -0.47        | -0.57      |
| clojure/clojure               | -1.62   | -0.47        | -0.53        | -0.63      |
| jashkenas/coffeescript        | -1.62   | -0.51        | -0.49        | -0.62      |
| red/red                       | -1.64   | -0.54        | -0.5         | -0.6       |
| cqfn/eo                       | -1.66   | -0.61        | -0.49        | -0.56      |
| livecode/livecode             | -1.71   | -0.63        | -0.52        | -0.56      |
| ChavaScript/chavascript       | -1.73   | -0.61        | -0.5         | -0.62      |
| terralang/terra               | -1.73   | -0.6         | -0.52        | -0.61      |
| IoLanguage/io                 | -1.76   | -0.61        | -0.52        | -0.63      |
| idris-lang/Idris-dev          | -1.77   | -0.63        | -0.51        | -0.62      |
| goby-lang/goby                | -1.77   | -0.61        | -0.53        | -0.63      |
| Frege/frege                   | -1.78   | -0.61        | -0.53        | -0.63      |
| typelead/eta                  | -1.79   | -0.63        | -0.53        | -0.63      |
| skiplang/skip                 | -1.79   | -0.64        | -0.53        | -0.62      |
| gkz/LiveScript                | -1.8    | -0.64        | -0.53        | -0.63      |
| gosu-lang/gosu-lang           | -1.81   | -0.65        | -0.53        | -0.63      |
| programming-nu/nu             | -1.81   | -0.65        | -0.53        | -0.63      |
| eclipse/golo-lang             | -1.81   | -0.65        | -0.53        | -0.63      |
| SenegalLang/Senegal           | -1.81   | -0.64        | -0.53        | -0.63      |
+-------------------------------+---------+--------------+--------------+------------+
```
