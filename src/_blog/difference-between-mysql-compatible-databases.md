---
title: Difference Between MySQL Compatible Databases
date: 2022-04-08
authors: [hooopo]
---


## Contributors

> Contributors open pull requests, issues and comment in pr body & issue body

<iframe width="100%" height="400" src="/charts/tidb-vs-mysql-compatible-databases-contributor.html?theme=vintage&v=3"></iframe>

<!--truncate-->

## Contributions
> Total Number of Pull Request + Issue + Comment + Review

<iframe width="100%" height="400" src="/charts/tidb-vs-mysql-compatible-databases-contribution.html?theme=vintage&v=3"></iframe>


## Code
> lines of modified code: additions + deletions

<iframe width="100%" height="400" src="/charts/tidb-vs-mysql-compatible-databases-code.html?theme=vintage&v=3"></iframe>


### The top 10 pull request code additions+deletions of `percona/percona-server`

```sql
gharchive_dev> select (additions+deletions) as lines_modified, concat('https://github.com/percona/percona-server/pull/', number) from github_ev
            -> ents where repo_name = 'percona/percona-server' order by lines_modified desc limit 10;
+----------------+-------------------------------------------------------------------+
| lines_modified | concat('https://github.com/percona/percona-server/pull/', number) |
+----------------+-------------------------------------------------------------------+
| 1847591        | https://github.com/percona/percona-server/pull/3474               |
| 1847131        | https://github.com/percona/percona-server/pull/3474               |
| 1611523        | https://github.com/percona/percona-server/pull/3978               |
| 1611239        | https://github.com/percona/percona-server/pull/3978               |
| 1526190        | https://github.com/percona/percona-server/pull/4204               |
| 1525900        | https://github.com/percona/percona-server/pull/4235               |
| 1525495        | https://github.com/percona/percona-server/pull/4235               |
| 1436855        | https://github.com/percona/percona-server/pull/4204               |
| 919569         | https://github.com/percona/percona-server/pull/4407               |
| 831538         | https://github.com/percona/percona-server/pull/3604               |
+----------------+-------------------------------------------------------------------+
10 rows in set
Time: 0.168s
gharchive_dev>
```


## Pull Requests
> Pull requests trend

<iframe width="100%" height="400" src="/charts/tidb-vs-mysql-compatible-databases-pull-request.html?theme=vintage&v=3"></iframe>
