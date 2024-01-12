# Feeds Server

A feeds server, which is a part of [OSSInsight](https://ossinsight.io) website, responsible for calculating repository feeds and pushing users the latest feeds from the repositories they followed.

## API

### Get Jobs List

Commend:

```shell
curl -s -X GET --url "http://127.0.0.1:30001/jobs" | jq -r
```

Result:

```json
[
  {
    "name": "calc-repo-milestones",
    "running": true
  },
  {
    "name": "send-repo-feeds-emails",
    "running": true
  }
]
```

### Get Job by Name

Commend:

```shell
curl -s -X GET --url "http://127.0.0.1:30001/jobs/calc-repo-milestones" | jq -r
```

Result:

```json
{
  "name": "calc-repo-milestones",
  "running": true,
  "parameters": {},
  "statuses": {}
}
```

### Start Job

Commend:

```shell
curl -s -X POST --url "http://127.0.0.1:30001/jobs/calc-repo-milestones/start" | jq -r
```

Result:

```json
{
  "name": "calc-repo-milestones",
  "running": true,
  "parameters": {},
  "statuses": {}
}
```

### Stop Job

Commend:

```shell
curl -s -X POST --url "http://127.0.0.1:30001/jobs/calc-repo-milestones/stop" | jq -r
```

Result:

```json
{
  "name": "calc-repo-milestones",
  "running": false,
  "parameters": {},
  "statuses": {}
}
```

### Run a New Job

Commend:

```shell
curl -s -X POST -H 'Content-type':'application/json' -d '{"name":"calc-repo-milestones","parameters":{"from":"2021-11-10","to":"2022-11-10"}}' --url "http://127.0.0.1:30001/jobs/run" | jq -r
```

Result:

```json
{
  "name": "calc-repo-milestones-1668046165280",
  "lastDate": "2022-11-10T02:09:25.283Z",
  "parameters": {
    "from": "2021-11-10",
    "to": "2022-11-10"
  }
}
```

## Tech Stack

- [fastify](https://github.com/fastify/fastify) – the WEB framework
- [Typescript](https://github.com/microsoft/TypeScript) – language
- [Mailing](https://github.com/sofn-xyz/mailing) – Email
- [TiDB](https://github.com/pingcap/tidb) – database
- [Vercel](https://github.com/vercel/vercel) – hosting
