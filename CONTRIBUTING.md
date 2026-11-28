# Contributing to OSS Insight

If you're interested in contributing to OSS Insight, hopefully, this document makes the process for contributing clear.

## Get Involved

There are many ways to contribute to OSS Insight, and many of them do not involve writing any code. Here's a few ideas to get started:

- Simply use OSS Insight. You can analyze any single GitHub repository/developers in depth, compare any two repositories using the same metrics, and provide comprehensive, valuable, and trending open source insights.
  - If you have any questions or want to share ideas when using  OSS Insight, you can make a discussion on [GitHub Discussions](https://github.com/pingcap/ossinsight/discussions).
  - Does everything work as expected? If not, we're always looking for improvements. Let us know by [**opening an issue**](https://github.com/pingcap/ossinsight/blob/main/CONTRIBUTING.md#issue).
- If you want to add a collection on our OSS Insight website, you can also [**add a collection**](https://github.com/pingcap/ossinsight/blob/main/CONTRIBUTING.md#add-a-collection) by submitting PRs.
- Look through the [open issues](https://github.com/pingcap/ossinsight/issues). Provide workarounds, ask for clarification, or suggest labels. If you find an issue you would like to fix, [**open a pull request**](https://github.com/pingcap/ossinsight/blob/main/CONTRIBUTING.md#pull-requests). 
- Read through the [OSS Insight Blogs](https://ossinsight.io/blog/). If you find anything that is confusing or can be improved, feel free to open a PR.
- If you have message or experience about using OSS Insight, you are welcome to [**add a new blog**](https://github.com/pingcap/ossinsight/blob/main/CONTRIBUTING.md#add-a-blog).


👏 We welcome your contributions here!  If you think you need help planning your contribution, please ping us on Twitter at [@OSS Insight](https://twitter.com/OSSInsight) and let us know you are looking for a bit of help.

## Issue

When [opening a new issue](https://github.com/pingcap/ossinsight/issues/new/choose), you can choose an issue template and always make sure to fill out the issue template. 

### Bugs

We use [GitHub Issues](https://github.com/pingcap/ossinsight/issues) for our public bugs. If you would like to report a problem, take a look around and see if someone already opened an issue about it. If you are certain this is a new, unreported bug, you can submit a [bug report](https://github.com/pingcap/ossinsight/issues/new?assignees=&labels=&template=bug_report.md&title=).

- **One issue, one bug:** Please report a single bug per issue.
- **Provide reproduction steps:** List a step by step guide for reproducing the bug. The person reading your bug report should be able to follow these steps to reproduce your issue with minimal effort.

If you're only fixing a bug, it's fine to submit a pull request right away but we still recommend filing an issue detailing what you're fixing. This is helpful in case we don't accept that specific fix but want to keep track of the issue.

### Feature requests

If you would like to request a new feature or enhancement but are not yet thinking about opening a pull request, you can submit a [feature request](https://github.com/pingcap/ossinsight/issues/new?assignees=&labels=&template=feature_request.md&title=).

## Development 

This is a pnpm monorepo. To run the website locally:

```bash
pnpm install
pnpm dev
```

The web app will run at http://localhost:3001/ by default.

## Pull Request

If you find an issue you would like to fix or want to add a collection, any feature you think OSS Insight should have, you can submit a pull request. You've invested a good chunk of time, and we appreciate it. We will do our best to work with you and get the PR looked at.

### PR Title Format

See how a minor change to your commit message style can make you a better programmer.

Please add the scope of pull request as the title prefix like:

```
<scope>: what's changed.
```

The scope could be `config`, `web`, `docs`, `etl`, `scripts` and etc.

The various types of commits:
- `config`: a new collection, etc.
- `web`: a change about website, etc.
- `docs`: a change about documentation, etc.
- `etl`: a change about data pipeline, etc.
- `scripts`: a change about utility scripts, etc.

Do not get too stressed about PR titles, however. Your code is more important than conventions!

Example：
- Suppose you submit a new repository to the collection's configuration, your pull request title could be:
`config: add pingcap/tidb repo to open source database collection`

You can learn more about how to write a good Pull Request title and description in the [document](https://github.com/pingcap/community/blob/master/contributors/commit-message-pr-style.md).

## Add a collection

You can add a collection on OSS Insight website by submitting PRs. 

The following is a file template for a collection that describes what you need to include.

Please create a `.yml` file under [the collections file path]( https://github.com/pingcap/ossinsight/tree/main/configs/collections).

* File Name

`<collection_id>.<collection_name>.yml`, For example: `10013.game-engine.yml`

  💡 Tips: Please use `100XX` as your collection's id，and it should be `+1` after the latest submit in [here]( https://github.com/pingcap/ossinsight/tree/main/configs/collections). 

* Content

```yml
id: <collection_id>
name: <collection_name>
items:
  - <repo_name_1>
  - <repo_name_2>
```

New collections are private when imported. A maintainer can mark a collection
public after reviewing its contents. Syncing its repository list preserves its
current publication setting.

You can validate your collection config locally before submitting:

```bash
node scripts/verify-collection.mjs --fix-suggestions
```

## Add a blog

You can add a blog on OSS Insight website by submitting PRs. 

Here is a folder template for a blog provides guidance on the information you need to include.

Please create a folder under [`apps/docs/content/blog/`]( https://github.com/pingcap/ossinsight/tree/main/apps/docs/content/blog), and create a `.md` file under the folder.

* Folder Name: describe the text briefly

For example: `deep-insight-into-programming-languages-2021`

* File Name: `index.md`

If the blog need to insert images, please put the image in this folder as well.

* Content

You need to configure the meta info as well. 

```markdown
---
title:
date:
authors:
tags: 
image: [this img will be used as your blog's cover]
description: [the abstract of your blog]
keywords:
---
```

👏 We look forward to your PRs! And we appreciate your contribution.
