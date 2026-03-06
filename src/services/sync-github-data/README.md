# @ossinsight/sync-github-data 🚧

A CLI tool for fetching GitHub user/repo data and persist it to the TiDB Serverless cluster.

Notice: It is designed to capture as much GitHub data as possible, but does not guarantee real-time updates.

## Usage

```shell
# Install dependencies.
npm i
# Run the CLI.
npm run dev:start
```

## Commands

### Users

#### Sync all users

```shell
npm run dev:start users sync-in-batch
```

### Repos

#### Sync all repos

```shell
npm run dev:start repos sync-in-batch
```