# OSSInsight Plugin

## Mechanism

1. Pull GitHub event by loop.
2. Filter the duplicate event.
3. Product event messages to `Pulsar`.
4. Consume event messages from `Plusar`.
5. Provide WebSocket API to the front end.

## Usage

1. Generate a new read-only token at [GitHub](https://github.com/settings/tokens).
2. Build binary file: `make build` (local) or `make build-server` (amd64 x86 linux).
3. Create a free pulsar cluster at [StreamNative Cloud](https://console.streamnative.cloud/organizations), and download key file.
4. Configure this file, and save to one of those path `./config.yaml`, `./config/config.yaml` or `../config/config.yaml` (relative path by binary file):

    ```yaml
    api:
        version: 2

    server:
        port: 6000 # HTTP port
        health: "/health" # health check api name
        syncEvent: "/sync-event" # event sync api name

    disable:
        producer: false # disable github fetcher and pulsar producer
        interval: false # disable interval

    log:
        level: debug
        file: test.log
        format: json # json/text

    # redis 7+
    redis:
        host: localhost:6379
        password: ""
        db: 0
        lua: # lua scripts
            mergeLatest: |
            local map = {}
            for i = KEYS[2], KEYS[3] do
                local res = redis.call('HGETALL', KEYS[1] .. i)
                for j = 1, #res, 2 do
                if map[res[j]] == nil then
                    map[res[j]] = tonumber(res[j + 1])
                else
                    map[res[j]] = map[res[j]] + tonumber(res[j + 1])
                end
                end
            end
            
            local result = {}
            for k, v in pairs(map) do
                table.insert(result, k)
                table.insert(result, v)
            end
            return result

    pulsar:
        env: dev # dev / formal, if env is dev, will use devHost and no auth way to create pulsar client
        devHost: pulsar://localhost:6650 # dev pulsar host
        host: pulsar+ssl://XXX.XXX.XXX:XXXX # pulsar host
        audience: XXX:XX:XXXXX:XXXXX:XXXX # pulsar audience
        keypath: /XXX/XXX/XXX.json # private key path, download form StreamNative cloud
        producer:
            topic: XXXXX # send topic name
            retry: 3 # send message retry times
        consumer:
            topic: XXXXX # consume topic name
            name: events-consumer # consumer name
            concurrency: 5 # consumer numbers in a single ossinsight-plugin

    github:
        loop:
            timeout: 5000 # github events fetch loop timeout (ms)
            break: 1000 # github events fetch loop break (ms)
        tokens:
            - ghp_XXXXXXXXXXXXXXXXXXXXXXXXX # github read-only token
   
    interval:
        yearCount: 1m # year count fetch interval
        dayCount: 1m # year count fetch interval
        daily: 1m
        retry: 3
        retryWait: 10000 # ms

    tidb:
        host: localhost # tidb host
        port: 4000 # tidb port
        user: root # tidb user
        password: "" # tidb password
        db: gharchive_dev # tidb database
        sql: # some sql
            eventsDaily: |
                SELECT event_day, 
                    COUNT(DISTINCT actor_id) AS developers,
                    COUNT(DISTINCT CASE WHEN action = 'opened' THEN pr_or_issue_id ELSE NULL END) AS opened_prs,
                    COUNT(DISTINCT CASE WHEN action = 'closed' AND pr_merged = false THEN pr_or_issue_id ELSE NULL END) AS closed_prs,
                    COUNT(DISTINCT CASE WHEN action = 'closed' AND pr_merged = true THEN pr_or_issue_id ELSE NULL END) AS merged_prs
                FROM github_events ge
                WHERE type = 'PullRequestEvent'
                    AND action IN ('closed', 'opened')
                    AND event_year = YEAR(NOW())
                GROUP BY event_day
                ORDER BY event_day
            yearly: |
                SELECT
                    COUNT(DISTINCT actor_id) AS developers,
                    COUNT(DISTINCT repo_id) AS repos,
                    SUM(CASE WHEN action = 'closed' AND pr_merged = true THEN additions ELSE 0 END) AS additions,
                    SUM(CASE WHEN action = 'closed' AND pr_merged = true THEN deletions ELSE 0 END) AS deletions
                FROM github_events
                WHERE type = 'PullRequestEvent'
                    AND action IN ('closed', 'opened')
                    AND event_year = YEAR(NOW())
    ```

5. Start by `./ossinsight-plugin`.

## Sampling API

### API Using Step

- `Client` start to connect the API Endpoint by `RAW WebSocket` protocol.
- `Server` will send an initial message by ***ONLY ONCE***.
- `Server` will waiting `Client` to send params.
- `Client` send params.
- `Server` will endless send message to `Client` until connection closed.

### Initial Message

The initial message will have `firstMessageTag` tag, and it will be true.

E.g.:

```json
{
    "firstMessageTag": true,
    "apiVersion": 2,
    "eventMap": {
        "2022-01-01": "34",
        "2022-01-02": "41",
        "2022-01-03": "100",
        "2022-01-04": "322",
        "2022-01-05": "326",
        "2022-01-06": "391"
    },
    "openMap": {
        "2022-01-01": "34",
        "2022-01-02": "41",
        "2022-01-03": "100",
        "2022-01-04": "322",
        "2022-01-05": "326",
        "2022-01-06": "391"
    },
    "mergeMap": {
        "2022-01-01": "34",
        "2022-01-02": "41",
        "2022-01-03": "100",
        "2022-01-04": "322",
        "2022-01-05": "326",
        "2022-01-06": "391"
    },
    "closeMap": {
        "2022-01-01": "34",
        "2022-01-02": "41",
        "2022-01-03": "100",
        "2022-01-04": "322",
        "2022-01-05": "326",
        "2022-01-06": "391"
    },
    "devMap": {
        "2022-01-01": "34",
        "2022-01-02": "41",
        "2022-01-03": "100",
        "2022-01-04": "322",
        "2022-01-05": "326",
        "2022-01-06": "391"
    },
    "sumMap": {
        "additions": "64787714692",
        "deletions": "25243554672",
        "dev": "2373829",
        "repo": "7594633"
    }
}
```

### Usage

Sampling message and return to client.

- Endpoint: `/sampling`, e.g.: `ws://localhost:6000/sampling`.
- Params:

    | Name | Required | Type | Description |
    | :- | :- | :- | :- |
    | `samplingRate` | Yes | int | Sampling rate. It means that N events are received that satisfy the conditions but only one of them is returned to the front end. If you want all of them, you need set it to `1`. |
    | `eventType` | No | string | Specify the event type you want to see. If you don't set it, all event types will be returned. |
    | `repoName` | No | string | Specify the repo name you want to see. If you don't set it, all repo names will be returned. |
    | `userName` | No | string | Specify the user name you want to see. If you don't set it, all user names will be returned. |
    | `filter` | No | string list | Specify the fields you want to see. If you don't set it, all fields will be returned. (This param will change result struct)|
    
    E.g.:

    ```json
    {
        "samplingRate": 3,
        "eventType": "PushEvent",
        "repoName": "pingcap-inc/ossinsight-plugin",
        "userName": "Icemap"
    }
    ```

- Result (the `{event entity}` is same as [/events](https://docs.github.com/en/rest/activity/events) API):

    ```json
    {
        "event": {event entity},
        "payload": {
            "devDay": 0,
            "devYear": 0,
            "merge": 0,
            "open": 0,
            "pr": 0
        }
    }
    ```

    E.g.:

    ```json
    {
        "event": {
            "type": "DeleteEvent",
            "public": true,
            "payload": {
                "ref": "dependabot/npm_and_yarn/netlify-cli-11.3.0",
                "ref_type": "branch",
                "pusher_type": "user"
            },
            "repo": {
                "id": 526513549,
                "name": "davy39/ntn-boilerplate",
                "url": "https://api.github.com/repos/davy39/ntn-boilerplate"
            },
            "actor": {
                "login": "dependabot[bot]",
                "id": 49699333,
                "avatar_url": "https://avatars.githubusercontent.com/u/49699333?",
                "gravatar_id": "",
                "url": "https://api.github.com/users/dependabot[bot]"
            },
            "created_at": "2022-08-29T02:06:15Z",
            "id": "23683284276"
        },
        "payload": {
            "devDay": 0,
            "devYear": 0,
            "merge": 0,
            "open": 0,
            "pr": 0
        }

    }
    ```

- With filter result will return a map, such as:
    
    Params:

    ```json
    {
        "samplingRate": 1,
        "filter": [
            "event.id", "event.type", "event.actor.login", "event.actor.avatar_url", "event.payload.push_id", "payload.merge"
        ]
    }
    ```

    Result:

    ```json
    {
        "event.actor.avatar_url": "https://avatars.githubusercontent.com/u/30280995?",
        "event.actor.login": "alanhaledc",
        "event.id": "23683417557",
        "event.payload.push_id": 10857043797,
        "event.type": "PushEvent",
        "payload.merge": 0
    }
    ```

- If you want a list:

    Params:

    ```json
    {
        "samplingRate": 1,
        "filter": [
            "event.id", "event.type", "event.actor.login", "event.actor.avatar_url", "event.payload.push_id", "payload.merge"
        ],
        "returnType": "list"
    }
    ```

    Result:

    ```json
    ["23683424409","PullRequestEvent","dependabot[bot]","https://avatars.githubusercontent.com/u/49699333?",null,0]
    ```

## Latest Language API

### API Using Step

- `Client` start to connect the API Endpoint by `RAW WebSocket` protocol.
- `Server` will waiting `Client` to send params.
- `Client` send params.
- `Server` will endless send message to `Client` until connection closed.

### Usage

Calculate latest hour PR language map and send to client every seconds.

- Endpoint: `/language/latest`, e.g.: `ws://localhost:6000/language/latest`.
- Params:

    | Name | Required | Type | Description |
    | :- | :- | :- | :- |
    | `language` | No | string list | Specify the language you want to see. If you don't set it, all fields will be returned. |
    | `top` | No | int | Send client the most PR languages with top. If you don't set it, entire map will be returned. |

    > **Note:**
    >
    > The `top` filter will be effect after `language` filter.

    E.g.:

    ```json
    {
        "top": 2,
        "language": ["JavaScript", "C++", "Java"]
    }
    ```

- Result:

    ```json
    {
        "Java": 112,
        "JavaScript": 178
    }
    ```

## Watch Language Change API

### API Using Step

- `Client` start to connect the API Endpoint by `RAW WebSocket` protocol.
- `Server` will send an initial message by ***ONLY ONCE***.
- `Server` will waiting `Client` to send params.
- `Client` send params.
- `Server` will endless send message to `Client` until connection closed.

### Initial Message

The initial message will has `firstMessageTag` tag, and it will be true.

E.g.:

```json
{
    "firstMessageTag": true,
    "apiVersion": 2,
    "languageMap": {
        "Bicep": 1,
        "C": 4,
        "TypeScript": 55,
        "Vue": 4
    }
}
```

### Usage

Language deletions map and additions map will be return every seconds(If deletions and additions are not both null).

- Endpoint: `/language/watch`, e.g.: `ws://localhost:6000/language/watch`.
- Params:

    | Name | Required | Type | Description |
    | :- | :- | :- | :- |
    | `language` | No | string list | Specify the language you want to see. If you don't set it, all fields will be returned. |

    E.g.:

    ```json
    {
        "language": ["JavaScript", "C++", "Java"]
    }
    ```

- Result:

    ```json
    {
        "Deletions": {},
        "Additions": {
            "Java": "1",
            "JavaScript": "3"
        }
    }
    ```
