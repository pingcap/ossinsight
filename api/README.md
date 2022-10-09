# OSSInsight API

The API server for OSSInsight.

## Run Sync Users Script

```shell
cd /api
pnpm run dev:sync-users sync-from-time-range-search \
    --from='2022-10-01' \
    --to=='2022-10-07' \
    --chunk-size='{ "days": 1 }' \
    --step-size='{ "minutes": 10 }' \
    --filter='fork:true'
```

## Run Sync Repos Script

```shell
cd /api
pnpm run dev:sync-repos sync-from-time-range-search \
    --from='2022-10-01' \
    --to=='2022-10-07' \
    --chunk-size='{ "days": 1 }' \
    --step-size='{ "minutes": 10 }'
```