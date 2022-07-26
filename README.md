<h1 align="center">Open Source Software Insight!</h1>

<a href="https://ossinsight.io">
  <img src="/static/img/screenshots/homepage.gif"
</a>

<h3 align="center">
  <b><a href="https://ossinsight.io/collections/open-source-database">Rankings</a></b>
  •
  <b><a href="https://ossinsight.io/analyze/Ovilia">Developer Analytics</a></b>
  •
  <a href="https://ossinsight.io/analyze/pingcap/tidb">Repository Analytics</a>
  •
  <a href="https://ossinsight.io/collections/open-source-database">Collections</a>
  •
  <a href="https://ossinsight.io/workshop/overview">Workshop</a>
  •
  <a href="https://ossinsight.io/blog">Blogs</a>
  •
  <a href="https://twitter.com/OSSInsight">Twitter</a>
</h3>

<p align="center">
OSS Insight analyze billions of GitHub events and get insights from them, also provide a set of tool which can analyze a single repository/developer, compare any two open source software hosted on GitHub.
</p>

## Feature 1: Preanalysis of some famous fields of technology 👁️

### Deep Insight
* [Deep Insight Into Open Source Databases](https://ossinsight.io/blog/deep-insight-into-open-source-databases)
* [JavaScript Framework Repos Landscape 2021](https://ossinsight.io/blog/deep-insight-into-js-framework-2021)
* [Web Framework Repos Landscape 2021](https://ossinsight.io/blog/deep-insight-into-web-framework-2021)
* [Programming Languages Repos Landscape 2021](https://ossinsight.io/blog/deep-insight-into-programming-languages-2021)
* [Low-code Development Tool Repos Landscape 2021](https://ossinsight.io/blog/deep-insight-into-lowcode-development-tools-2021)
* [More](https://ossinsight.io/blog) ...

### GitHub Collections Analysis
* [Collection: Web Framework](https://ossinsight.io/collections/web-framework)
* [Collection: Artificial Intelligence](https://ossinsight.io/collections/artificial-intelligence)
* [Collection: Web3](https://ossinsight.io/collections/web3)
* [More](https://ossinsight.io/collections/open-source-database) ...

If you want to analyze more, please [contact us](https://ossinsight.io/about/#contact) ✉️

### How to add collections
👏 We welcome your contributions here! You can add a collection on our website by submitting PRs. Please create a `.yml` file under [the collections file path]( https://github.com/pingcap/ossinsight/tree/main/backend/meta/collections).

Here is a file template provides guidance on the information you need to include.

* File Name

`<collection_id>.<collection_name>.yml`, For example: `10013.game-engine.yml`

  💡 Tips: Please use `100XX` as your collection's id，and it should be `+1` after the latest submit in [here]( https://github.com/pingcap/ossinsight/tree/main/backend/meta/collections). 

* Content

```yml
id: <collection_id>
name: <collection_name>
items:
  - <repo_name_1>
  - <repo_name_2>
```

Looks forward to your PRs！

## Feature 2: Developer Analytics
  
* Basic:
  * star, behaviour, most used lLanguages, contribution trends
  * code (commits/pull requests/pull request size/code line changes), code reviews, issues
* Advanced:
  * contribution time distribution for all kind of contribution activities
  * monthly stats about contribution activities in all public repositories
  
Examples:
* [Ovilia](https://ossinsight.io/analyze/Ovilia)
* [midudev](https://ossinsight.io/analyze/midudev)
* [samswag](https://ossinsight.io/analyze/samswag)
* [mheap](https://ossinsight.io/analyze/mheap)
* [levxyca](https://ossinsight.io/analyze/levxyca)

## Feature 3: Repository Analytics
  
* Basic:
  * star, fork, issues, commits, pull requests, contributors, programming languages, lines of code modified
  * Historical Trends of these metrics
  * Time Cost of issues, pull requests
* Advanced:
  * Geographical Distribution of stargazers, issue creators, pull requests creators
  * Company Distribution of stargazers, issue creators, pull requests creators
  
Examples:
* [React](https://ossinsight.io/analyze/facebook/react)
* [TiDB](https://ossinsight.io/analyze/pingcap/tidb)
* [Django](https://ossinsight.io/analyze/django/django)
* [Go Lang](https://ossinsight.io/analyze/golang/go)
* [Ant Design](https://ossinsight.io/analyze/ant-design/ant-design)
* [Chaos Mesh](https://ossinsight.io/analyze/chaos-mesh/chaos-mesh)

## Feature 4: Compare Projects 🔨
  
Compare repo metrics mentioned above in **Repository Analytics**

Examples:
* [Compare Vue and React](https://ossinsight.io/analyze/vuejs/vue?vs=facebook/react)
* [Compare Hugo and Docusaurus](https://ossinsight.io/analyze/gohugoio/hugo?vs=facebook/docusaurus)
* [Compare CockroachDB and TiDB](https://ossinsight.io/analyze/pingcap/tidb?vs=cockroachdb/cockroach)
* [Compare PyTorch and TensorFlow](https://ossinsight.io/analyze/pytorch/pytorch?vs=tensorflow/tensorflow)
* [Compare Django and Flask](https://ossinsight.io/analyze/django/django?vs=pallets/flask)
* [Compare Visual Studio Code and Atom](https://ossinsight.io/analyze/microsoft/vscode?vs=atom/atom)
* [Compare Go and Rust](https://ossinsight.io/analyze/golang/go?vs=rust-lang/rust)
* [Compare Spark and Flink](https://ossinsight.io/analyze/apache/spark?vs=apache/flink)
* [Compare Ant Design and Material-UI](https://ossinsight.io/analyze/ant-design/ant-design?vs=mui/material-ui)
* [Compare Chaos Mesh and Chaosblade](https://ossinsight.io/analyze/chaos-mesh/chaos-mesh?vs=chaosblade-io/chaosblade)

## Development

* [Step by Step](https://ossinsight.io/workshop/mini-ossinsight/step-by-step/find-data-source)
* [Docker Compose](https://ossinsight.io/workshop/mini-ossinsight/docker-compose)

## Sponsors

<div align="center">
  <a href="https://en.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral">
    <img src="/static/img/tidb-cloud-logo-w.png" height=50 />
  </a>
</div>
